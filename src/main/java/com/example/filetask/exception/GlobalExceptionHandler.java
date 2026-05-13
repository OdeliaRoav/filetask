package com.example.filetask.exception;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

//RestControllerAdvice -> 프로젝트 전역에서 발생하는 예외를 잡아준다.
//또한 ControllerAdvice와 달리 ResponseBody가 붙어 있어 응답을 JSON으로 내려준다. 즉 Restful API를 사용할 때 적합하다.
@RestControllerAdvice
public class GlobalExceptionHandler {
    //해당클래스에 대해 처리한다.
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        return createErrorResponse(e.getErrorCode());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception e) {
        return createErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ErrorResponse> createErrorResponse(ErrorCode errorCode) {
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ErrorResponse.of(errorCode));
    }
}
