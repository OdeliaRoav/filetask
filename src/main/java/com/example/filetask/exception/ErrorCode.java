package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

// API에서 예상 가능한 실패 상황을 한 곳에서 관리
// Service에서 상황에 맞는 ErrorCode를 선택하고, GlobalExceptionHandler가 JSON 응답으로 변환
public enum ErrorCode {

    // 파일 업로드 요청값 검증 실패
    INVALID_FILE_EXTENSION(HttpStatus.BAD_REQUEST, "dbfile 파일만 업로드할 수 있습니다."),
    INVALID_FILE_COLUMN_COUNT(HttpStatus.BAD_REQUEST, "데이터 컬럼 수가 맞지 않습니다."),
    INVALID_DATE_FORMAT(HttpStatus.BAD_REQUEST, "날짜 형식이 맞지 않습니다. yyyy-MM-dd HH:mm:ss 형식으로 입력하세요."),
    REQUIRED_VALUE_EMPTY(HttpStatus.BAD_REQUEST, "필수값이 비어있습니다."),

    // 회원가입과 로그인 처리 중 발생하는 계정 관련 실패
    DUPLICATE_USER(HttpStatus.CONFLICT, "존재하는 아이디입니다."),
    LOGIN_ID_NOT_FOUND(HttpStatus.UNAUTHORIZED, "아이디가 없습니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다."),

    // 저장된 사용자 데이터 조작 중 발생하는 실패
    DELETE_USER_NOT_FOUND(HttpStatus.NOT_FOUND, "삭제할 ID를 찾을 수 없습니다."),

    // 예상하지 못한 에러 발생 시
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String message;

    // 각 실패 케이스가 내려줄 HTTP 상태와 사용자 메시지를 같이 보관
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
