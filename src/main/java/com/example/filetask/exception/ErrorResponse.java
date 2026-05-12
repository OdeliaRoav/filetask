package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

// record를 사용하면 timestamp, status, error, message 필드와 getter 역할의 메서드가 자동으로 만들어진다.
// 예외 응답은 모든 API에서 같은 JSON 구조로 내려가야 하므로 ErrorResponse 하나로 응답 모양을 통일한다.
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message
) {

    public static ErrorResponse of(HttpStatus status, String message) {
        // GlobalExceptionHandler에서 넘겨준 HttpStatus를 기준으로 상태코드와 기본 에러 문구를 채운다.
        // message는 Service에서 던진 예외 메시지를 그대로 담아 클라이언트가 실패 이유를 알 수 있게 한다.
        return new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message
        );
    }
}
