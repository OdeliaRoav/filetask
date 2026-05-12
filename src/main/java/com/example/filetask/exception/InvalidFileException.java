package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

public class InvalidFileException extends BusinessException {

    public InvalidFileException(String message) {
        //400에러
        super(HttpStatus.BAD_REQUEST, message);
    }

}
