package com.example.filetask.service;

import com.example.filetask.entity.User;
import com.example.filetask.entity.Info;
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
            throw new RuntimeException("dbfile 파일만 업로드할 수 있습니다.");
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

        BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()));

        List<String> lines = new ArrayList<>();

        String line;
        while ((line = br.readLine()) != null) {
            lines.add(line);
        }

        int successCount = 0;
        int failCount = 0;

        List<String> failList = new ArrayList<>();

        for (int i = 0; i < lines.size(); i++) {
            String oneLine = lines.get(i);

            try {
                String[] data = oneLine.split("/", -1);
                // split이 limit 기준으로 >0이면 갯수대로, 0이면 빈값은 제외하고 출력, limit<0이면 빈값도 모두 출력함 즉 홍길동/B//5432 이런게 가능해진다는 뜻
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

            } catch (Exception e) { // User 클래스 안에 id, desc, regtime 등 누락 시
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


    public Optional<User> findById(String id){
        return userQueryRepository.findById(id);
    }

    public List<User> getAllUsers(){
        return userQueryRepository.findAllUsers();
    }

    public List<User> searchUsers(String field, String keyword){
        return userQueryRepository.searchUsers(field, keyword);
    }

    public void signup(Info user) {
        if(infoRepository.existsById(user.getId())){
            throw new RuntimeException("존재하는 아이디입니다.");
        }
        Info signupUser = Info.signup(user.getId(), user.getPwd(), user.getName());
        infoRepository.save(signupUser);
    }

    public Info login(String id, String pwd) {
        Info user = infoRepository.findById(id).orElseThrow(()-> new RuntimeException("아이디가 없습니다."));

        if(!user.getPwd().equals(pwd)){
            throw new RuntimeException("비밀번호가 없습니다");
        }

        return user;
    }


    //Swagger용
    //ResponseEntity
    public ResponseEntity<String> deleteById(String id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body("NOT_FOUND");
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok("삭제");
    }

    public ResponseEntity<String> deleteAllUsers() {
        userRepository.deleteAll();
        return ResponseEntity.ok("전체 삭제");

    }
}


