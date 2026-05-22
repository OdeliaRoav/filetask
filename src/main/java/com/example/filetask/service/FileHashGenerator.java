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

    public String generateFileHash(MultipartFile file) {
        try{
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(file.getBytes());
            return HexFormat.of().formatHex(hash);
        }catch (IOException e){
            throw new BusinessException(ErrorCode.FILE_READ_ERROR);
        }catch (NoSuchAlgorithmException e){
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}
