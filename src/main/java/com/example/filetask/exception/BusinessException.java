package com.example.filetask.exception;

import org.springframework.http.HttpStatus;


//throw가능한 얘들은 throwable 계열이여야 가능하다.
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public HttpStatus getStatus() {
        return errorCode.getStatus();
    }

    public ErrorCode getErrorCode(){
        return errorCode;
    }

}
