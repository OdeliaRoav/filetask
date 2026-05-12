package com.example.filetask.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

//RestControllerAdvice -> 프로젝트 전역에서 발생하는 예외를 잡아준다.
//또한 ControllerAdvice와 달리 ResponseBody가 붙어 있어 응답을 JSON으로 내려준다. 즉 Restful API를 사용할 때 적합하다.
@RestControllerAdvice
public class GlobalExceptionHandler {
    //해당클래스에 대해 처리한다.
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        return createErrorResponse(e.getStatus(), e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception e) {
        return createErrorResponse(
                //500에러
                HttpStatus.INTERNAL_SERVER_ERROR,
                "서버 내부 오류가 발생했습니다."
        );
    }

    private ResponseEntity<ErrorResponse> createErrorResponse(HttpStatus status, String message) {
        return ResponseEntity
                .status(status)
                .body(ErrorResponse.of(status, message));
    }
}