package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

public class UserNotFoundException extends BusinessException {

    public UserNotFoundException(String message) {
        //404에러
        super(HttpStatus.NOT_FOUND, message);
    }
}
