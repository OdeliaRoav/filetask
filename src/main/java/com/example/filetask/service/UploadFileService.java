package com.example.filetask.service;


import com.example.filetask.dto.UploadResponse;
import com.example.filetask.entity.FileUser;
import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import com.example.filetask.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class UploadFileService {
        // 업로드 흐름 담당
        private final UserRepository userRepository;
        private final RedisTemplate<String, String> redisTemplate;
        private final FileUserParser fileUserParser;
        private final FileHashGenerator fileHashGenerator;
        private final UploadFileNameValidator uploadFileNameValidator;
        private final UploadDuplicateChecker uploadDuplicateChecker;

        // dbfile 업로드 처리
        // 파일 검증, 중복 업로드 확인, 라인별 저장 결과 집계를 수행하고 화면에서 사용할 DTO를 반환
        public UploadResponse uploadFile(MultipartFile file, boolean force){
            String fileName = uploadFileNameValidator.validate(file);

            // 파일 내용을 기준으로 redis에 저장한다.
            UploadDuplicateResult duplicateResult = uploadDuplicateChecker.check(file);

            if(duplicateResult.duplicated() && !force){
                return UploadResponse.duplicated(fileName, duplicateResult.ttlSeconds());
            }

            List<String> lines = fileUserParser.readLines(file);
            UploadResult result = processLine(lines);

            if(result.isSuccess()){
                redisTemplate.opsForValue().set(duplicateResult.redisKey(), fileName, Duration.ofSeconds(300));
                log.info(duplicateResult.redisKey());
            }

            return result.toResponse(
                    duplicateResult.duplicated(),
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

        private UploadResult processLine(List<String> lines){
            UploadResult result = new UploadResult();

            for(int i = 0; i < lines.size(); i++){
                String oneLine = lines.get(i);
                try{
                    FileUser fileUser = fileUserParser.parseLine(oneLine);
                    saveFileUser(fileUser);
                    result.addSuccess();
                }catch(Exception e){
                    result.addFail(i+1, oneLine, e);
                }

            }
            return result;
        }


}
