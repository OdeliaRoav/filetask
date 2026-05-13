package com.example.filetask.exception;

import org.springframework.http.HttpStatus;

// 프로젝트에서 예상 가능한 실패 상황을 한 곳에서 관리한다.
// Service는 상황에 맞는 ErrorCode만 선택하고, 실제 JSON 응답은 GlobalExceptionHandler에서 만든다.
public enum ErrorCode {

    // 업로드 파일 검증 실패는 요청값 문제이므로 400 Bad Request로 응답한다.
    INVALID_FILE_EXTENSION(HttpStatus.BAD_REQUEST, "dbfile 파일만 업로드할 수 있습니다."),
    INVALID_FILE_COLUMN_COUNT(HttpStatus.BAD_REQUEST, "데이터 컬럼 수가 맞지 않습니다."),
    REQUIRED_VALUE_EMPTY(HttpStatus.BAD_REQUEST, "필수값이 비어있습니다."),
    INVALID_COLUMN(HttpStatus.BAD_REQUEST, "삭제할 수 없는 컬럼입니다."),

    // 회원가입과 로그인처럼 사용자 계정 처리 중 발생하는 실패 상황이다.
    DUPLICATE_USER(HttpStatus.CONFLICT, "존재하는 아이디입니다."),
    LOGIN_ID_NOT_FOUND(HttpStatus.UNAUTHORIZED, "아이디가 없습니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다."),

    // 조회, 삭제, 셀 수정처럼 이미 저장된 사용자 데이터를 대상으로 하는 실패 상황이다.
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "값을 찾을 수 없습니다."),
    DELETE_USER_NOT_FOUND(HttpStatus.NOT_FOUND, "삭제할 ID를 찾을 수 없습니다."),

    // 예상하지 못한 예외는 마지막 안전망에서 서버 내부 오류로 응답한다.
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        // 각 에러 코드는 HTTP 상태코드와 기본 메시지를 같이 가지고 있어 응답 기준을 한 곳에서 볼 수 있다.
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
