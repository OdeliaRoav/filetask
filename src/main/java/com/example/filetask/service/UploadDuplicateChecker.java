package com.example.filetask.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UploadDuplicateChecker {
    // 파일 내용 해시 생성과 Redis 조회를 사용해 최근 업로드 중복 여부를 확인한다.
    private final FileHashGenerator fileHashGenerator;
    private final RedisTemplate<String, String> redisTemplate;


    // 파일명과 상관없이 내용이 같은 파일이면 같은 해시가 나오므로, 해시를 Redis key로 사용한다.
    public UploadDuplicateResult check(MultipartFile file){
        String fileHash = fileHashGenerator.generateFileHash(file);
        String redisKey = "recent:file:" + fileHash;
        Boolean duplicated = redisTemplate.hasKey(redisKey);
        Long ttlSeconds = redisTemplate.getExpire(redisKey);

        // UploadFileService가 Redis 조회 세부 로직을 몰라도 되도록 필요한 값을 결과 객체로 묶어 반환한다.
        return new UploadDuplicateResult(
                duplicated,
                fileHash,
                redisKey,
                ttlSeconds == null ? 0 : ttlSeconds
        );
    }
}
