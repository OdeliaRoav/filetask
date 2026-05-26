package com.example.filetask.service;

import com.example.filetask.dto.FileUserResponse;
import com.example.filetask.dto.UploadResponse;
import com.example.filetask.entity.FileUser;
import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import com.example.filetask.repository.UserQueryRepository;
import com.example.filetask.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.List;

@RequiredArgsConstructor
@Service
public class UserService {
    // 업로드 흐름 담당

    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final UserQueryRepository userQueryRepository;
    private final FileUserParser fileUserParser;
    private final FileHashGenerator fileHashGenerator;
    private final UploadFileNameValidator uploadFileNameValidator;

    // dbfile 업로드 처리
    // 파일 검증, 중복 업로드 확인, 라인별 저장 결과 집계를 수행하고 화면에서 사용할 결과 Map을 반환
    public UploadResponse uploadFile(MultipartFile file, boolean force) {
        String fileName = uploadFileNameValidator.validate(file);

        // 파일 내용을 기준으로 redis에 저장한다.
        String fileHash = fileHashGenerator.generateFileHash(file);
        String redisKey = "recent:file:" + fileHash;
        Boolean duplicated = redisTemplate.hasKey(redisKey);

        if (Boolean.TRUE.equals(duplicated) && !force) {
            Long ttlSeconds = redisTemplate.getExpire(redisKey);
            return UploadResponse.duplicated(fileName, ttlSeconds);
        }

        List<String> lines = fileUserParser.readLines(file);

        UploadResult result = new UploadResult();

        for (int i = 0; i < lines.size(); i++) {
            String oneLine = lines.get(i);
            try {
                FileUser fileUser = fileUserParser.parseLine(oneLine);
                saveFileUser(fileUser);
                result.addSuccess();
            } catch (Exception e) {
                result.addFail(i+1, oneLine, e);
            }
        }

        if (result.isSuccess()) {
            redisTemplate.opsForValue().set(redisKey, fileName, Duration.ofSeconds(300));
        }

        return result.toResponse(
                duplicated,
                force,
                fileName,
                lines.size(),
                result.isSuccess() ? 300 : 0
        );
    }

    // 무엇을 하는지 명확하게 보기 위해 분리
    private void saveFileUser(FileUser fileUser){
        if(userRepository.existsById(fileUser.getId())){
            throw new BusinessException(ErrorCode.DUPLICATE_USER);
        }
        userRepository.save(fileUser);
    }

    // Grid 전체 조회
    // Controller는 요청만 받고 실제 조회 방식은 QueryDSL Repository에 보낸다.
    public List<FileUserResponse> getAllUsers() {
        return userQueryRepository.findAllUsers()
                .stream()
                .map(FileUserResponse::user)
                .toList();
    }

    // Grid 조건 검색
    // field/keyword를 그대로 Repository로 넘겨 검색 조건 생성 책임을 한 곳에 둔다.
    public List<FileUserResponse> searchUsers(String field, String keyword) {
        if (!List.of("id", "name", "level", "desc").contains(field)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        return userQueryRepository.searchUsers(field, keyword)
                .stream()
                .map(FileUserResponse::user)
                .toList();
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


