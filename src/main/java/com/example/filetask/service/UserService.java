package com.example.filetask.service;

import com.example.filetask.entity.User;
import com.example.filetask.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile; // HTMl에서 파일 올리면 Spring이 MultipartFile형태로 전달해주는 역할

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;

    //생성자 안쓰려면 @RequiredArgsConstructor 근데 생성자 쓰는게 더 편한것같음
    public UserService(UserRepository userRepository, RedisTemplate<String, String> redisTemplate) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate; //파일명 기준으로 레디스에 저장하고 중복 시 확인을 묻는 방향으로
    }


    //입출력시 예외처리 생각해야함
    //MultipartFile은 HTML에서 파일 업로드시 저장되는 그 유형뭐시기
    public Map<String, Object> uploadFile(MultipartFile file, boolean force) throws IOException {

        Map<String, Object> result = new HashMap<>();
        String fileName = file.getOriginalFilename(); //.dbfile인지 확인하기 위해서 원래 이름 그대로 가져옴

        if (fileName == null || !fileName.endsWith(".dbfile")) {
            throw new RuntimeException("dbfile 파일만 업로드할 수 있습니다.");
            // 요구사항 4번 : dbfile 이외 확장자는 모두 예외처리
        }
        BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()));

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

        String line;
        while ((line = br.readLine()) != null) {
            lines.add(line);
        }

        int successCount = 0;
        int failCount = 0;
        //만약 실패한다면?
        List<String> failList = new ArrayList<>();

        for (int i = 0; i < lines.size(); i++) {
            String oneLine = lines.get(i);

            try {
                String[] data = oneLine.split("/", -1);
                //split이 limit 기준으로 >0이면 갯수대로, 0이면 빈값은 제외하고 출력, limit<0이면 빈값도 모두 출력함 즉 홍길동/B//5432 이런게 가능해진다는 뜻
                User user = new User(
                        data[0],
                        data[1],
                        data[2],
                        data[3],
                        data[4].isEmpty() ? null : data[4],
                        LocalDateTime.parse(data[5], DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                );

                userRepository.save(user);
                successCount++;

            } catch (Exception e) { //User 클래스 안에 id, desc, regtime 등 누락 시
                failList.add((i + 1) + "번 줄 실패 : " + oneLine);
                failCount++;
            }
        }

        redisTemplate.opsForValue().set(redisKey, fileName, Duration.ofSeconds(300));

        result.put("duplicated", Boolean.TRUE.equals(duplicated));
        result.put("forced", force);
        result.put("fileName", fileName);
        result.put("totalCount", lines.size());
        result.put("successCount", successCount);
        result.put("failList", failList);
        result.put("failCount", failCount);
        result.put("ttlSeconds", 300);

        //result.get하려면 int면 int test = (int)result.get("totalCount"); 이런식으로
        return result;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
