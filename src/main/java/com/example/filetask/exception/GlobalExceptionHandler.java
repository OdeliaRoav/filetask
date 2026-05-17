package com.example.filetask.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
// 전역 예외 처리기
// Controller마다 try-catch를 반복하지 않고, 모든 REST 실패 응답을 ErrorResponse JSON으로 통일
@RestControllerAdvice
public class GlobalExceptionHandler {
    // Service에서 던진 업무 예외는 ErrorCode에 정의된 상태코드와 메시지로 응답
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        return createErrorResponse(e.getErrorCode());
    }

    // 예상하지 못한 예외는 서버 내부 오류로 숨겨 일관된 응답 형식을 유지
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception e) {
        log.error("예상하지 못한 에러 : ", e);
        return createErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR);
    }

    // ErrorCode를 HTTP status와 응답 body로 변환하는 공통 생성 지점
    private ResponseEntity<ErrorResponse> createErrorResponse(ErrorCode errorCode) {
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ErrorResponse.of(errorCode));
    }
}
