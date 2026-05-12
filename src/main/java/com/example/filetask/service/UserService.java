package com.example.filetask.service;

import com.example.filetask.entity.User;
import com.example.filetask.entity.Info;
import com.example.filetask.exception.*;
import com.example.filetask.repository.InfoRepository;
import com.example.filetask.repository.UserQueryRepository;
import com.example.filetask.repository.UserRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile; // HTML에서 파일 올리면 Spring이 MultipartFile 형태로 전달해주는 역할

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final InfoRepository infoRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final UserQueryRepository userQueryRepository;



    public UserService(UserRepository userRepository, RedisTemplate<String, String> redisTemplate, UserQueryRepository userQueryRepository, InfoRepository infoRepository) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.userQueryRepository = userQueryRepository;
        this.infoRepository = infoRepository;
    }


    public Map<String, Object> uploadFile(MultipartFile file, boolean force) throws IOException {

        Map<String, Object> result = new HashMap<>();
        String fileName = file.getOriginalFilename();

        if (fileName == null || !fileName.endsWith(".dbfile")) {
            throw new InvalidFileException("dbfile 파일만 업로드할 수 있습니다.");
        }

        String redisKey = "recent:" + fileName;
        Boolean duplicated = redisTemplate.hasKey(redisKey);

        if(Boolean.TRUE.equals(duplicated) && !force){
            Long ttlSeconds = redisTemplate.getExpire(redisKey);
            result.put("duplicated", true);
            result.put("forced", false);
            result.put("message", "5분 안에 같은 파일명이 업로드되었습니다.");
            result.put("fileName", fileName);
            result.put("ttlSeconds", ttlSeconds);

            return result;
        }

        List<String> lines = new ArrayList<>();


        //try-with-resources 자바7부터 자원을 자동으로 반납해주는 문법 -> BUfferedReader 사용 후 반납
        try(BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))){
            String line;
            while((line = br.readLine()) != null){
                lines.add(line);
            }

        }

        int successCount = 0;
        int failCount = 0;

        List<String> failList = new ArrayList<>();

        for (int i = 0; i < lines.size(); i++) {
            String oneLine = lines.get(i);

            try {
                String[] data = oneLine.split("/", -1);
                // split("/", -1) 빈 컬럼도 보존
                if(data.length != 6){
                    throw new InvalidFileException("데이터 컬럼 수가 맞지 않습니다.");
                }
                if(data[0].isBlank() || data[1].isBlank() || data[2].isBlank() || data[3].isBlank() || data[5].isBlank()){
                    throw new InvalidFileException("필수값이 비어있습니다.");
                }
                User user = new User(
                        data[0],
                        data[1],
                        data[2],
                        data[3],
                        data[4],
                        LocalDateTime.parse(data[5], DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                );

                userRepository.save(user);
                successCount++;

            } catch (Exception e) {
                failList.add((i + 1) + "번 줄 실패 : " + oneLine);
                failCount++;
            }
        }

        //Redis에 저장
        redisTemplate.opsForValue().set(redisKey, fileName, Duration.ofSeconds(300));

        result.put("duplicated", Boolean.TRUE.equals(duplicated));
        result.put("forced", force);
        result.put("fileName", fileName);
        result.put("totalCount", lines.size());
        result.put("successCount", successCount);
        result.put("failList", failList);
        result.put("failCount", failCount);
        result.put("ttlSeconds", 300);


        return result;
    }




    public List<User> getAllUsers(){
        return userQueryRepository.findAllUsers();
    }

    public List<User> searchUsers(String field, String keyword){
        return userQueryRepository.searchUsers(field, keyword);
    }

    public void signup(Info user) {
        if(infoRepository.existsById(user.getId())){
            throw new DuplicateUserException("존재하는 아이디입니다.");
        }

        Info signupUser = Info.signup(user.getId(), user.getPwd(), user.getName());
        infoRepository.save(signupUser);
    }

    public Info login(String id, String pwd) {
        Info user = infoRepository.findById(id).orElseThrow(()->{
            throw new LoginFailedException("아이디가 없습니다.");
        });

        if(!user.getPwd().equals(pwd)){
            throw new LoginFailedException("비밀번호가 없습니다.");
        }

        return user;
    }



    // 수정해야할 부분 -> ResponseEntity로 서비스단의 활용을 막고 있음, 왜? 사용을 서비스 단에서 계속 해야하지만
    // return ResponseEntity.ok로 재활용성이 떨어짐 즉 서바스단에서는 일회용에 불과

    public void deleteAllUsers(){
        userRepository.deleteAll();
    }


    //ResponseEntity
    public void deleteById(String id){
        if(!userRepository.existsById(id)){
            throw new UserNotFoundException("삭제할 사용자를 찾을 수 없습니다.");
        }
        userRepository.deleteById(id);
    }


    public void deleteCell(String rowId, String colId){
        User user = userRepository.findById(rowId).orElseThrow(()->{
            throw new UserNotFoundException("값을 찾을 수 없습니다.");
        });

        switch(colId){
            case "name" :
                user.clearName();
                break;
            case "level" :
                user.clearLevel();
                break;
            case "desc" :
                user.clearDesc();
                break;
            default :
                throw new InvalidColumnException("삭제할 수 없는 컬럼입니다.");
        }
        userRepository.save(user);
    }

}


