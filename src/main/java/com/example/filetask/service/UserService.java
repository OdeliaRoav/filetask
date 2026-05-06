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



    //List : 순서가 있으며, 데이터(값) 중복 허용
    //Set : 순서가 없으며, 데이터(값) 중복을 허용하지 않음
    //Map : Key&Value 구조, Key는 중복을 허용하지 않으며, Value(값)은 중복을 허용
    //파일 업로드 처리를 하고, 그 결과(성공 여부, 파일명 등)를 Map 형태의 데이터 묶음으로 반환하는 함수.
    public Map<String, Object> uploadFile(MultipartFile file, boolean force) throws IOException {

        Map<String, Object> result = new HashMap<>();
        String fileName = file.getOriginalFilename();

        //만약에 JS에서 뚫리면 이걸로 잡음
        if (fileName == null || !fileName.endsWith(".dbfile")) {
            throw new RuntimeException("dbfile 파일만 업로드할 수 있습니다.");
        }

        String redisKey = "recent:" + fileName;
        Boolean duplicated = redisTemplate.hasKey(redisKey);


        //Redis TTL 부분
        //redis-cli 매번 안하면 안되서 그냥 Boolean RedisAvaliable = false 만들어서 try-catch로 Exception e 잡아도 괜찮을 것 같다.

        if(Boolean.TRUE.equals(duplicated) && !force){
            Long ttlSeconds = redisTemplate.getExpire(redisKey);
            result.put("duplicated", true);
            result.put("forced", false);
            result.put("message", "5분 안에 같은 파일명이 업로드되었습니다.");
            result.put("fileName", fileName);
            result.put("ttlSeconds", ttlSeconds);

            return result;
        }

        //여기서부터 시작 jsp -> PageController -> JS(업로드 버튼) -> 후에 시작하는곳
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


/*
    public Optional<User> findById(String id){
        return userRepository.findById(id);
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }
QueryDSL 안쓸때
*/
