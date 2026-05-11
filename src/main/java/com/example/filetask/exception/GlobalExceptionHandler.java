package com.example.filetask.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 파일 확장자처럼 클라이언트가 잘못 보낸 요청은 400 Bad Request로 통일해서 응답한다.
    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<ErrorResponse> handleInvalidFile(InvalidFileException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST, e.getMessage()));
    }

    // 이미 존재하는 회원 ID는 요청 형식 문제가 아니라 현재 서버 데이터와 충돌한 상황이므로 409 Conflict로 응답한다.
    @ExceptionHandler(DuplicateUserException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateUser(DuplicateUserException e) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(HttpStatus.CONFLICT, e.getMessage()));
    }

    // 로그인 실패는 인증 정보가 맞지 않은 상황이므로 401 Unauthorized로 응답한다.
    @ExceptionHandler(LoginFailedException.class)
    public ResponseEntity<ErrorResponse> handleLoginFailed(LoginFailedException e) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(HttpStatus.UNAUTHORIZED, e.getMessage()));
    }

    // 삭제나 조회 대상이 DB에 없는 경우는 요청한 리소스가 없다는 뜻이므로 404 Not Found로 응답한다.
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(HttpStatus.NOT_FOUND, e.getMessage()));
    }

    // 셀 삭제에서 허용하지 않은 컬럼을 요청한 경우는 클라이언트 요청값 오류이므로 400 Bad Request로 응답한다.
    @ExceptionHandler(InvalidColumnException.class)
    public ResponseEntity<ErrorResponse> handleInvalidColumn(InvalidColumnException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST, e.getMessage()));
    }

    // 예상하지 못한 예외는 마지막 안전망에서 500으로 응답해 서버 내부 오류임을 명확히 한다.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "서버 처리 중 오류가 발생했습니다."));
    }
}
