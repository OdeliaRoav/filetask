package com.example.filetask.service;

import com.example.filetask.entity.User;
import com.example.filetask.entity.Info;
import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
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

        if (fileName == null || !fileName.endsWith(".dbfile")) {
            // 업로드 가능한 확장자는 과제 조건 4번 .dbfile만 허용한다.
            // 잘못된 확장자는 INVALID_FILE_EXTENSION 코드로 표현하고, GlobalExceptionHandler가 400 응답으로 변환한다.
            throw new BusinessException(ErrorCode.INVALID_FILE_EXTENSION);
        }

        String redisKey = "recent:" + fileName;
        Boolean duplicated = redisTemplate.hasKey(redisKey);

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

        // 파일 입력 스트림은 사용 후 닫아야 하므로 try-with-resources로 자동 close 처리한다.
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
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
                // split("/", -1)는 빈 컬럼도 보존하므로, 저장 전에 컬럼 수와 필수값을 검증한다.
                // 검증 실패 예외는 아래 catch에서 라인 단위로 처리하여 다음 라인 업로드를 계속 진행한다.
                if (data.length != 6) {
                    throw new BusinessException(ErrorCode.INVALID_FILE_COLUMN_COUNT);
                }

                if (data[0].isBlank() || data[1].isBlank() || data[2].isBlank()
                        || data[3].isBlank() || data[5].isBlank()) {
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
                failList.add((i + 1) + "번째 줄 실패 : " + e.getMessage() + " / " + oneLine);
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

    public List<User> getAllUsers() {
        return userQueryRepository.findAllUsers();
    }

    public List<User> searchUsers(String field, String keyword) {
        return userQueryRepository.searchUsers(field, keyword);
    }

    public void signup(Info user) {
        if (infoRepository.existsById(user.getId())) {
            // 회원가입 ID는 중복될 수 없으므로 저장 전에 Repository로 존재 여부를 확인한다.
            // 중복 ID는 서버 오류가 아니라 현재 데이터와 충돌한 요청이므로 DUPLICATE_USER 코드로 처리한다.
            throw new BusinessException(ErrorCode.DUPLICATE_USER);
        }

        Info signupUser = Info.signup(user.getId(), user.getPwd(), user.getName());
        infoRepository.save(signupUser);
    }

    public Info login(String id, String pwd) {
        Info user = infoRepository.findById(id).orElseThrow(() -> {
            // 로그인은 아이디가 존재해야 비밀번호 검증을 진행할 수 있다.
            // 존재하지 않는 아이디는 LOGIN_ID_NOT_FOUND 코드의 401 응답으로 변환한다.
            return new BusinessException(ErrorCode.LOGIN_ID_NOT_FOUND);
        });

        if (!user.getPwd().equals(pwd)) {
            // 비밀번호 불일치는 INVALID_PASSWORD 코드로 구분해 응답한다.
            // Controller에 try-catch를 두지 않고 공통 예외 처리기가 401 응답을 만든다.
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        return user;
    }

    public void deleteAllUsers() {
        userRepository.deleteAll();
    }

    public void deleteById(String id) {
        // Service는 HTTP 상태코드를 직접 만들지 않고, 삭제 가능 여부를 예외로 표현한다.
        // 404 같은 응답 표현은 GlobalExceptionHandler가 담당해야 계층 역할이 분리된다.
        User user = userRepository.findById(id).orElseThrow(() -> {
            // 삭제 대상이 없으면 정상 삭제로 볼 수 없으므로 DELETE_USER_NOT_FOUND 코드로 표현한다.
            // 이 예외는 GlobalExceptionHandler에서 404 Not Found 응답으로 변환된다.
            return new BusinessException(ErrorCode.DELETE_USER_NOT_FOUND);
        });

        // existsById로 확인하고 deleteById를 다시 호출하면 DB 접근이 두 번 발생할 수 있다.
        // 이미 조회한 엔티티를 그대로 삭제해 불필요한 조회를 줄인다.
        userRepository.delete(user);
    }

    public void deleteCell(String rowId, String colId) {
        // 이 메서드는 셀 삭제 비즈니스 규칙만 처리하고 실제 HTTP 응답은 GlobalExceptionHandler가 만든다.
        // 대상 행이 없거나 컬럼명이 잘못된 경우에는 각각 의미가 분명한 ErrorCode를 선택해 던진다.
        User user = userRepository.findById(rowId).orElseThrow(() -> {
            // 셀 삭제는 먼저 rowId에 해당하는 사용자가 있어야 수행할 수 있다.
            // 대상 행이 없으면 GlobalExceptionHandler에서 404로 처리한다.
            return new BusinessException(ErrorCode.USER_NOT_FOUND);
        });
        switch (colId) {
            case "name":
                user.clearName();
                break;
            case "level":
                user.clearLevel();
                break;
            case "desc":
                user.clearDesc();
                break;
            default:
                // 셀 삭제는 name, level, desc만 허용한다.
                // 그 외 컬럼 요청은 클라이언트가 잘못된 컬럼명을 보낸 것이므로 400으로 처리한다.
                throw new BusinessException(ErrorCode.INVALID_COLUMN);
        }

        userRepository.save(user);
    }

//Swagger용
    public Optional<User> findById(String id) {
        return userQueryRepository.findById(id);
    }

}
