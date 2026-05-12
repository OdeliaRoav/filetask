package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

public class LoginFailedException extends BusinessException {

    public LoginFailedException(String message) {
        //401에러
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
