package com.example.filetask.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // BusinessException은 Service에서 의도적으로 던지는 업무 예외이다.
    // 실패 상황의 종류와 상태코드는 ErrorCode가 가지고 있고,
    // 여기서는 예외별 메서드를 늘리지 않고 공통 JSON 응답 형식만 만들어서 내려준다.
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        return createErrorResponse(e.getStatus(), e.getMessage());
    }

    // 예상하지 못한 예외는 마지막 안전망에서 500으로 응답해 서버 내부 오류임을 명확히 한다.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        return createErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "서버 처리 중 오류가 발생했습니다."
        );
    }

    private ResponseEntity<ErrorResponse> createErrorResponse(HttpStatus status, String message) {
        // ErrorResponse.of를 통해 timestamp, status, error, message 구조를 매번 동일하게 맞춘다.
        // 이렇게 해두면 프론트나 API 사용자는 어떤 예외가 발생해도 같은 형식의 JSON을 받을 수 있다.
        return ResponseEntity
                .status(status)
                .body(ErrorResponse.of(status, message));
    }
}
