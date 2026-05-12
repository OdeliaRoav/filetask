package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

public class DuplicateUserException extends BusinessException {

    public DuplicateUserException(String message) {
        //409에러
        super(HttpStatus.CONFLICT, message);
    }

}
