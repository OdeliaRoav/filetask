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
        // 업로드 처리에 필요한 저장소와 각 기능별 객체를 주입받는다.
        // Controller는 요청만 전달하고, 업로드 흐름 조율은 이 Service에서 담당한다.
        private final UserRepository userRepository;
        private final RedisTemplate<String, String> redisTemplate;
        private final FileUserParser fileUserParser;
        private final UploadFileNameValidator uploadFileNameValidator;
        private final UploadDuplicateChecker uploadDuplicateChecker;

        // dbfile 업로드 처리
        // 파일 검증, 중복 업로드 확인, 라인별 저장 처리, 응답 DTO 생성을 순서대로 조율한다.
        public UploadResponse uploadFile(MultipartFile file, boolean force){
            // 파일명과 빈 파일 여부를 먼저 확인한다.
            String fileName = uploadFileNameValidator.validate(file);

            // 파일 내용 해시를 기준으로 Redis에 최근 업로드 이력이 있는지 확인한다.
            UploadDuplicateResult duplicateResult = uploadDuplicateChecker.check(file);

            // 같은 파일이 최근에 업로드되었고 강제 업로드가 아니면 저장하지 않고 중복 응답을 반환한다.
            if(duplicateResult.duplicated() && !force){
                return UploadResponse.duplicated(fileName, duplicateResult.ttlSeconds());
            }

            // 파일 내용을 한 줄씩 읽은 뒤, 각 줄을 FileUser로 변환하고 저장한다.
            List<String> lines = fileUserParser.readLines(file);
            UploadResult result = processLine(lines);

            // 하나라도 저장에 성공한 경우에만 Redis에 최근 업로드 기록을 남긴다.
            if(result.isSuccess()){
                redisTemplate.opsForValue().set(duplicateResult.redisKey(), fileName, Duration.ofSeconds(300));
                log.info(duplicateResult.redisKey());
            }

            // 화면에서 사용할 업로드 처리 결과를 응답 DTO로 변환한다.
            return result.toResponse(
                    duplicateResult.duplicated(),
                    force,
                    fileName,
                    lines.size(),
                    result.isSuccess() ? 300 : 0
            );

        }

        // FileUser 저장 전 ID 중복 여부를 확인한다.
        // 이미 같은 ID가 있으면 해당 줄은 실패 처리될 수 있도록 업무 예외를 던진다.
        private void saveFileUser(FileUser fileUser){
            if(userRepository.existsById(fileUser.getId())){
                throw new BusinessException(ErrorCode.DUPLICATE_USER);
            }
            userRepository.save(fileUser);
        }

        // 파일의 각 줄을 순서대로 파싱하고 저장하면서 성공/실패 결과를 누적한다.
        // 한 줄에서 예외가 발생해도 전체 업로드가 중단되지 않도록 실패 목록에만 기록한다.
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
