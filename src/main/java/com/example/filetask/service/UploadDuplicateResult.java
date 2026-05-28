package com.example.filetask.service;

public record UploadDuplicateResult (boolean duplicated, String fileHash, String redisKey, long ttlSeconds){

}
