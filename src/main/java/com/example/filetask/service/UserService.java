package com.example.filetask.service;

import com.example.filetask.entity.User;
import com.example.filetask.entity.Info;
import com.example.filetask.exception.*;
import com.example.filetask.repository.InfoRepository;
import com.example.filetask.repository.UserQueryRepository;
import com.example.filetask.repository.UserRepository;
import org.springframework.data.redis.core.RedisTemplate;
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

        /*동작 : ErrorCode에서 INVALID_FILE_EXTENSION을 찾는다.
        *       ErrorCode에서는 Status랑 Message를 전달해주고 있다. (409, 존재하는 아이디)
        *       BusinessException 객체 생성 -> 즉 BusinessException에서 Status -> 409, Message -> 존재하는 아이디로 생성해서
        *       throw로 메서드가 바로 중단된다. 컨트롤러도 멈추고 Service도 아래 전부 멈춤
        *       이걸 GlobalExceptionHandler가 throw 발생한걸 확인하고 발생한 BusinessException을 잡음 -> BusinessException e
        *       여기서 e에는 ErrorCode랑 Message가 들어있다.
        *       즉 return createErrorResponse(e.getErrorCode()) -> ErrorCode.DUPLICATE_USER가 들어있다.
        * */


        if (fileName == null || !fileName.endsWith(".dbfile")) {
            throw new BusinessException(ErrorCode.INVALID_FILE_EXTENSION);
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
                    throw new BusinessException(ErrorCode.INVALID_FILE_COLUMN_COUNT);
                }
                if(data[0].isBlank() || data[1].isBlank() || data[2].isBlank() || data[3].isBlank() || data[5].isBlank()){
                    throw new BusinessException(ErrorCode.REQUIRED_VALUE_EMPTY);
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
            throw new BusinessException(ErrorCode.DUPLICATE_USER);
        }

        Info signupUser = Info.signup(user.getId(), user.getPwd(), user.getName());
        infoRepository.save(signupUser);
    }

    public Info login(String id, String pwd) {
        Info user = infoRepository.findById(id).orElseThrow(()->{
            throw new BusinessException(ErrorCode.LOGIN_ID_NOT_FOUND);
        });

        if(!user.getPwd().equals(pwd)){
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        return user;
    }



    public void deleteById(String id){
        if(!userRepository.existsById(id)){
            throw new BusinessException(ErrorCode.DELETE_USER_NOT_FOUND);
        }
        userRepository.deleteById(id);
    }

}


