package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

public enum testEnum{
    FILE_SUCCESS(HttpStatus.OK, "업로드 성공"),
    FILE_FAIL(HttpStatus.NOT_FOUND, "업로드 실패");

    private final  HttpStatus status;
    private final String message;

    testEnum(HttpStatus status, String message){
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }


}