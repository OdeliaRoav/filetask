package com.example.filetask.service;

import com.example.filetask.entity.FileUser;
import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import com.example.filetask.repository.UserQueryRepository;
import com.example.filetask.repository.UserRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final UserQueryRepository userQueryRepository;

    public UserService(UserRepository userRepository, RedisTemplate<String, String> redisTemplate, UserQueryRepository userQueryRepository) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.userQueryRepository = userQueryRepository;
    }

    // dbfile 업로드 처리
    // 파일 검증, 중복 업로드 확인, 라인별 저장 결과 집계를 수행하고 화면에서 사용할 결과 Map을 반환
    public Map<String, Object> uploadFile(MultipartFile file, boolean force) {
        Map<String, Object> result = new HashMap<>();
        String fileName = file.getOriginalFilename();

        // 업로드 가능한 파일은 과제 조건의 .dbfile로 제한하고, 실패 응답은 공통 ErrorCode로 표현
        if (fileName == null || !fileName.endsWith(".dbfile")) {
            throw new BusinessException(ErrorCode.INVALID_FILE_EXTENSION);
        }

        String redisKey = "recent:" + fileName;
        Boolean duplicated = redisTemplate.hasKey(redisKey);

        //force -> default : false
        // 같은 파일명이 TTL 안에 다시 올라오면 저장하지 않고 확인용 응답을 내려 강제 업로드 여부를 받는다.
        if (duplicated && !force) {
            Long ttlSeconds = redisTemplate.getExpire(redisKey);

            result.put("duplicated", true);
            result.put("forced", false);
            result.put("message", "5분 안에 같은 파일명이 업로드되었습니다.");
            result.put("fileName", fileName);
            result.put("ttlSeconds", ttlSeconds);

            return result;
        }

        List<String> lines = new ArrayList<>();

        // 자원 해제 try-with-resources로 파일 읽기 자원 관리
        // StandardCharsets.UTF_8 문자 깨짐 방지
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) {
                lines.add(line);
            }
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_READ_ERROR);
        }

        int successCount = 0;
        int failCount = 0;

        List<String> failList = new ArrayList<>();

        for (int i = 0; i < lines.size(); i++) {
            String oneLine = lines.get(i);

            try {
                // 빈 컬럼도 보존[split("/", -1)]해야 컬럼 수 누락을 구분할 수 있다.
                String[] data = oneLine.split("/", -1);
                //길이가 6이 아닐 때 예외처리
                if (data.length != 6) {
                    throw new BusinessException(ErrorCode.INVALID_FILE_COLUMN_COUNT);
                }
                //값이 비어있을 경우 예외처리
                if (data[0].isBlank() || data[1].isBlank() || data[2].isBlank() || data[3].isBlank() || data[5].isBlank()) {
                    throw new BusinessException(ErrorCode.REQUIRED_VALUE_EMPTY);
                }

//                LocalDateTime regDate;
//                try {
//                    regDate = LocalDateTime.parse(data[5], DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
//                } catch (DateTimeParseException e) {
//                    throw new BusinessException(ErrorCode.INVALID_DATE_FORMAT);
//                }

                LocalDateTime regDate = parseRegDate(data[5]);


                FileUser fileUser = new FileUser(
                        data[0],
                        data[1],
                        data[2],
                        data[3],
                        data[4],
                        regDate
                );

                userRepository.save(fileUser);
                successCount++;

            } catch (Exception e) {
                failList.add((i + 1) + "번 줄 실패 : " + oneLine + "\n" + e.getMessage());
                failCount++;
            }
        }



        // 실제 저장된 데이터가 있을 때만 파일명을 Redis에 저장해 중복 업로드를 감지한다.
        // 모두 실패되는 파일은 ttl 설정이 불필요하기 때문이다.
        if (successCount > 0) {
            redisTemplate.opsForValue().set(redisKey, fileName, Duration.ofSeconds(300));
        }

        result.put("duplicated", Boolean.TRUE.equals(duplicated));
        result.put("forced", force);
        result.put("fileName", fileName);
        result.put("totalCount", lines.size());
        result.put("successCount", successCount);
        result.put("failList", failList);
        result.put("failCount", failCount);
        result.put("ttlSeconds", successCount > 0 ? 300 : 0);

        return result;
    }

    private LocalDateTime parseRegDate(String value){
        try{
            return LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        }catch (DateTimeParseException e){
            throw new BusinessException(ErrorCode.INVALID_DATE_FORMAT);
        }
    }

    // Grid 전체 조회
    // Controller는 요청만 받고 실제 조회 방식은 QueryDSL Repository에 보낸다.
    public List<FileUser> getAllUsers() {
        return userQueryRepository.findAllUsers();
    }

    // Grid 조건 검색
    // field/keyword를 그대로 Repository로 넘겨 검색 조건 생성 책임을 한 곳에 둔다.
    public List<FileUser> searchUsers(String field, String keyword) {
        if(!List.of("userid", "name", "email", "desc").contains(field)){
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        return userQueryRepository.searchUsers(field, keyword);
    }

    // ID 기준 삭제 처리
    // 삭제 대상이 없으면 업무 예외로 표현하고, 응답 상태코드 변환은 GlobalExceptionHandler가 담당
    public void deleteById(String id) {
        FileUser fileUser = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.DELETE_USER_NOT_FOUND));
        userRepository.delete(fileUser);
    }

}


