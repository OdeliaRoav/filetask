package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

//enum은 내부적으로 java.lang.Enum을 상속하고 있기 때문에 RuntimeException을 상속할 수 없음 (자바 클래스는 다중 상속 불가능)
public enum ErrorCode {

    INVALID_FILE_EXTENSION(HttpStatus.BAD_REQUEST, "dbfile 파일만 업로드할 수 있습니다."),
    INVALID_FILE_COLUMN_COUNT(HttpStatus.BAD_REQUEST, "데이터 컬럼 수가 맞지 않습니다."),
    REQUIRED_VALUE_EMPTY(HttpStatus.BAD_REQUEST, "필수값이 비어있습니다."),
    INVALID_COLUMN(HttpStatus.BAD_REQUEST, "삭제할 수 없는 컬럼입니다."),

    DUPLICATE_USER(HttpStatus.CONFLICT, "존재하는 아이디입니다."),
    LOGIN_ID_NOT_FOUND(HttpStatus.UNAUTHORIZED, "아이디가 없습니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "값을 찾을 수 없습니다."),
    DELETE_USER_NOT_FOUND(HttpStatus.NOT_FOUND, "삭제할 ID를 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}
