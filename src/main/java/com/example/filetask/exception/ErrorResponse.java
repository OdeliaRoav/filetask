package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

// 모든 API 예외 응답의 JSON 구조를 통일
// 프론트는 message로 사용자 안내를 하고, code로 실패 종류를 구분할 수 있다.
public record ErrorResponse(
        int status,
        String error,
        String code,
        String message )
{
    // ErrorCode 하나를 기준으로 status, code, message가 같은 규칙으로 내려가도록 변환
    public static ErrorResponse of(ErrorCode errorCode) {
        HttpStatus status = errorCode.getStatus();

        return new ErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                errorCode.name(),
                errorCode.getMessage()
        );
    }
}
