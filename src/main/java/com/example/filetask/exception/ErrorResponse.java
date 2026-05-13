package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

// 예외 응답은 모든 API에서 같은 JSON 구조로 내려가야 하므로 ErrorResponse 하나로 응답 모양을 통일한다.
// code 필드는 프론트에서 메시지 문자열이 아니라 에러 종류를 기준으로 분기할 때 사용할 수 있다.
public record ErrorResponse(
        int status,
        String error,
        String code,
        String message
) {

    public static ErrorResponse of(ErrorCode errorCode) {
        // ErrorCode에 정의된 상태코드와 메시지를 기준으로 클라이언트에 내려줄 응답 객체를 만든다.
        HttpStatus status = errorCode.getStatus();

        return new ErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                errorCode.name(),
                errorCode.getMessage()
        );
    }
}
