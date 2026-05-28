package com.example.filetask.service;


import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UploadDuplicateChecker {
    private final FileHashGenerator fileHashGenerator;
    private final RedisTemplate<String, String> redisTemplate;


    public UploadDuplicateResult check(MultipartFile file){
        String fileHash = fileHashGenerator.generateFileHash(file);
        String redisKey = "recent:file:" + fileHash;
        Boolean duplicated = redisTemplate.hasKey(redisKey);
        Long ttlSeconds = redisTemplate.getExpire(redisKey);

        return new UploadDuplicateResult(
                duplicated,
                fileHash,
                redisKey,
                ttlSeconds == null ? 300 : 0
        );
    }
}
