package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

    //record를 사용하면 필드를 선언하면서 자동으로 생성되는 메서드들을 통해 코드를 간결하게 작성할 수 있다.
public record ErrorResponse(
        int status,
        String error,
        String code,
        String message )
{   //of -> 메서드의 파라미터로 넘어온 값들을 검증하여 인스턴스를 생성할 때 사용한다.
    public static ErrorResponse of(ErrorCode errorCode){
        HttpStatus status = errorCode.getStatus();

        return new ErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                errorCode.name(),
                errorCode.getMessage()
        );
    }
}
