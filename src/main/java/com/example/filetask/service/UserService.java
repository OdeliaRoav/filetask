package com.example.filetask.service;

import com.example.filetask.dto.UploadResponse;
import com.example.filetask.entity.FileUser;
import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import com.example.filetask.repository.UserQueryRepository;
import com.example.filetask.repository.UserRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {
    // 업로드 흐름 담당

    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final UserQueryRepository userQueryRepository;
    private final FileUserParser fileUserParser;

    public UserService(UserRepository userRepository, RedisTemplate<String, String> redisTemplate, UserQueryRepository userQueryRepository, FileUserParser fileUserParser) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.userQueryRepository = userQueryRepository;
        this.fileUserParser = fileUserParser;
    }

    // dbfile 업로드 처리
    // 파일 검증, 중복 업로드 확인, 라인별 저장 결과 집계를 수행하고 화면에서 사용할 결과 Map을 반환
    public UploadResponse uploadFile(MultipartFile file, boolean force) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.REQUIRED_VALUE_EMPTY);
        }

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
            return UploadResponse.duplicated(fileName, ttlSeconds);
        }

        List<String> lines = fileUserParser.readLines(file);

        int successCount = 0;
        int failCount = 0;
        List<String> failList = new ArrayList<>();

        for (int i = 0; i < lines.size(); i++) {
            String oneLine = lines.get(i);
            try {
                FileUser fileUser = fileUserParser.parseLine(oneLine);
                userRepository.save(fileUser);
                successCount++;
            } catch (Exception e) {
                failList.add((i + 1) + "번 줄 실패 : " + oneLine + "\n" + e.getMessage());
                failCount++;
            }
        }

        if (successCount > 0) {
            redisTemplate.opsForValue().set(redisKey, fileName, Duration.ofSeconds(300));
        }

        return UploadResponse.complete(
                duplicated,
                force,
                fileName,
                lines.size(),
                successCount,
                failList,
                failCount,
                successCount > 0 ? 300:0
        );

    }

    // Grid 전체 조회
    // Controller는 요청만 받고 실제 조회 방식은 QueryDSL Repository에 보낸다.
    public List<FileUser> getAllUsers() {
        return userQueryRepository.findAllUsers();
    }

    // Grid 조건 검색
    // field/keyword를 그대로 Repository로 넘겨 검색 조건 생성 책임을 한 곳에 둔다.
    public List<FileUser> searchUsers(String field, String keyword) {
        if(!List.of("id", "name", "level", "desc").contains(field)){
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


//    private LocalDateTime parseRegDate(String value){
//        try{
//            return LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
//        }catch (DateTimeParseException e){
//            throw new BusinessException(ErrorCode.INVALID_DATE_FORMAT);
//        }
//    }


