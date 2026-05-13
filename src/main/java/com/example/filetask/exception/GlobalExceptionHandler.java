package com.example.filetask.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// RestControllerAdvice는 프로젝트 전역에서 발생한 예외를 잡고 JSON 응답으로 변환한다.
// Controller마다 try-catch를 반복하지 않도록 실패 응답 생성 책임을 이 클래스에 모은다.
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Service에서 던진 업무 예외는 ErrorCode에 정의된 상태코드와 메시지로 응답한다.
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        return createErrorResponse(e.getErrorCode());
    }

    // 예상하지 못한 예외는 마지막 안전망에서 INTERNAL_SERVER_ERROR 코드로 응답한다.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception e) {
        return createErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ErrorResponse> createErrorResponse(ErrorCode errorCode) {
        // ErrorCode 하나만 넘기면 status, code, message가 같은 규칙으로 내려가도록 맞춘다.
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ErrorResponse.of(errorCode));
    }
}
