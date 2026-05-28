package com.example.filetask.service;

// Redis 중복 업로드 검사 결과를 UploadFileService에 전달하기 위한 값 객체
public record UploadDuplicateResult(boolean duplicated, String fileHash, String redisKey, long ttlSeconds){

}
