package com.example.filetask.service;

import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UploadFileNameValidator {
    public String validate(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if(fileName == null || !fileName.endsWith(".dbfile")){
            throw new BusinessException(ErrorCode.INVALID_FILE_EXTENSION);
        }

        if(file == null || file.isEmpty()){
            throw new BusinessException(ErrorCode.REQUIRED_VALUE_EMPTY);
        }

        return fileName;
    }
}
