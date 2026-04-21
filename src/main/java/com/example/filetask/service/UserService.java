package com.example.filetask.service;

import com.example.filetask.entity.User;
import com.example.filetask.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile; // HTMl에서 파일 올리면 Spring이 MultipartFile형태로 전달해주는 역할

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    //입출력시 예외처리 생각해야함
    public Map<String, Object> uploadFile(MultipartFile file) throws IOException {

        Map<String, Object> result = new HashMap<>();
        String fileName = file.getOriginalFilename(); //.dbfile인지 확인하기 위해서 원래 이름 그대로 가져옴

        if (fileName == null || !fileName.endsWith(".dbfile")) {
            throw new RuntimeException("dbfile 파일만 업로드할 수 있습니다.");
            // 잘못된 파일이면 즉시 에러 발생 -> RuntimeException
        }

        BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()));
        List<String> lines = new ArrayList<>();

        String line;
        while ((line = br.readLine()) != null) {
            lines.add(line);
        }

        int successCount = 0;
        //만약 실패한다면?
        List<String> failList = new ArrayList<>();

        for (int i = 0; i < lines.size(); i++) {
            String oneLine = lines.get(i);

            try {
                String[] data = oneLine.split("/", -1);

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
            }
        }

        result.put("totalCount", lines.size());
        result.put("successCount", successCount);
        result.put("failList", failList);

        return result;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}