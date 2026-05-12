package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

public class InvalidColumnException extends BusinessException {

    public InvalidColumnException(String message) {
        //400에러
        super(HttpStatus.BAD_REQUEST, message);
    }
}
