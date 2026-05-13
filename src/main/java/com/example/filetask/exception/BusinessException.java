package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

// Service에서 의도적으로 발생시키는 업무 예외를 하나의 타입으로 모은다.
// 실패 종류는 ErrorCode가 가지고 있고, 이 클래스는 throw 할 수 있는 예외 객체 역할을 담당한다.
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        // RuntimeException의 message에는 ErrorCode의 기본 메시지를 넣어 예외 내용도 바로 확인할 수 있게 한다.
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public HttpStatus getStatus() {
        // HTTP 상태코드는 ErrorCode에만 두고 여기서는 꺼내 쓰기만 해서 상태값이 중복 관리되지 않게 한다.
        return errorCode.getStatus();
    }

    public ErrorCode getErrorCode() {
        // GlobalExceptionHandler가 응답 status, code, message를 만들 때 사용한다.
        return errorCode;
    }
}
