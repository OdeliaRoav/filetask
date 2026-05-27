package com.example.filetask.service;

import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
public class FileHashGenerator {
    // 파일 내용을 SHA-256 해시 알고리즘으로 변경 담당
    public String generateFileHash(MultipartFile file) {
        try{
            // 입력 데이터가 무엇이든 결과는 항상 결과는 256 비트이다.
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            // byte로 데이터를 받아서 저장
            byte[] hash = digest.digest(file.getBytes());
            // byte 배열을 16진수 문자열로 바꾼다.
            // a-f, 0-9로 나와서 key로 적합하다.
            return HexFormat.of().formatHex(hash);
        }catch (IOException e){
            throw new BusinessException(ErrorCode.FILE_READ_ERROR);
        }catch (NoSuchAlgorithmException e){
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}
