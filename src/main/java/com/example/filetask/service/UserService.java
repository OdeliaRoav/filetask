package com.example.filetask.service;

import com.example.filetask.dto.LoginRequest;
import com.example.filetask.dto.SignupRequest;
import com.example.filetask.entity.Info;
import com.example.filetask.entity.User;
import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import com.example.filetask.repository.InfoRepository;
import com.example.filetask.repository.UserQueryRepository;
import com.example.filetask.repository.UserRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
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
    private final InfoRepository infoRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final UserQueryRepository userQueryRepository;

    public UserService(UserRepository userRepository, RedisTemplate<String, String> redisTemplate, UserQueryRepository userQueryRepository, InfoRepository infoRepository) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.userQueryRepository = userQueryRepository;
        this.infoRepository = infoRepository;
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

        // 같은 파일명이 TTL 안에 다시 올라오면 저장하지 않고 확인용 응답을 내려 강제 업로드 여부를 받는다.
        if (Boolean.TRUE.equals(duplicated) && !force) {
            Long ttlSeconds = redisTemplate.getExpire(redisKey);
            result.put("duplicated", true);
            result.put("forced", false);
            result.put("message", "5분 안에 같은 파일명이 업로드되었습니다.");
            result.put("fileName", fileName);
            result.put("ttlSeconds", ttlSeconds);

            return result;
        }

        List<String> lines = new ArrayList<>();

        // 자원 해제 try-with-resources(자바 7 이상부터 사용 가능)로 파일 읽기 자원을 관리
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
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

                LocalDateTime regDate;
                try {
                    regDate = LocalDateTime.parse(data[5], DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                } catch (DateTimeParseException e) {
                    throw new BusinessException(ErrorCode.INVALID_DATE_FORMAT);
                }

                User user = new User(
                        data[0],
                        data[1],
                        data[2],
                        data[3],
                        data[4],
                        regDate
                );

                userRepository.save(user);
                successCount++;

            } catch (Exception e) {
                failList.add((i + 1) + "번 줄 실패 : " + oneLine + "\n" + e.getMessage());
                failCount++;
            }
        }

        // 실제 저장된 데이터가 있을 때만 파일명을 Redis에 저장해 중복 업로드를 감지한다.
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

    // Grid 전체 조회
    // Controller는 요청만 받고 실제 조회 방식은 QueryDSL Repository에 보낸다.
    public List<User> getAllUsers() {
        return userQueryRepository.findAllUsers();
    }

    // Grid 조건 검색
    // field/keyword를 그대로 Repository로 넘겨 검색 조건 생성 책임을 한 곳에 둔다.
    public List<User> searchUsers(String field, String keyword) {
        return userQueryRepository.searchUsers(field, keyword);
    }

    // 회원가입 처리
    // 아이디 중복 여부를 먼저 확인한 뒤 Info 엔티티 생성 규칙을 통해 저장
    public void signup(SignupRequest request) {
        if (isBlank(request.getId()) || isBlank(request.getPwd()) || isBlank(request.getName())) {
            throw new BusinessException(ErrorCode.REQUIRED_VALUE_EMPTY);
        }

        if (infoRepository.existsById(request.getId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_USER);
        }

        Info signupUser = Info.signup(request.getId(), request.getPwd(), request.getName());
        infoRepository.save(signupUser);
    }

    // 로그인 처리
    // 아이디 존재 여부와 비밀번호 불일치를 다른 ErrorCode로 구분해 화면 메시지를 표현
    public void login(LoginRequest request) {
        if (isBlank(request.getId()) || isBlank(request.getPwd())) {
            throw new BusinessException(ErrorCode.REQUIRED_VALUE_EMPTY);
        }
        //JPA findById -> Optional로 .orElseThrow() 사용
        Info user = infoRepository.findById(request.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.LOGIN_ID_NOT_FOUND));

        if (!user.getPwd().equals(request.getPwd())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }
    }

    // ID 기준 삭제 처리
    // 삭제 대상이 없으면 업무 예외로 표현하고, 응답 상태코드 변환은 GlobalExceptionHandler가 담당
    public void deleteById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.DELETE_USER_NOT_FOUND));
        userRepository.delete(user);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

}


