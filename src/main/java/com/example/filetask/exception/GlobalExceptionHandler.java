package com.example.filetask.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

//RestControllerAdvice -> 프로젝트 전역에서 발생하는 예외를 잡아준다.
//또한 ControllerAdvice와 달리 ResponseBody가 붙어 있어 응답을 JSON으로 내려준다. 즉 Restful API를 사용할 때 적합하다.
@RestControllerAdvice
public class GlobalExceptionHandler {

    //해당하는 클래스에 대해 처리하는 메서드를 작성한다.
    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<ErrorResponse> handleInvalidFile(InvalidFileException e) {
        //400에러
        HttpStatus status = HttpStatus.BAD_REQUEST;

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                e.getMessage()
        );

        return ResponseEntity
                .status(status)
                .body(errorResponse);
    }

    @ExceptionHandler(DuplicateUserException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateUser(DuplicateUserException e){
        //409에러 -> 아이디가 중복으로 서버와 충돌
        HttpStatus status = HttpStatus.CONFLICT;

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                e.getMessage()
        );

        return ResponseEntity
                .status(status)
                .body(errorResponse);

    }

    @ExceptionHandler(InvalidColumnException.class)
    public ResponseEntity<ErrorResponse> handleInvalidColumn(InvalidColumnException e){
        //500에러
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                e.getMessage()
        );
        return ResponseEntity
                .status(status)
                .body(errorResponse);
    }

    @ExceptionHandler(LoginFailedException.class)
    public ResponseEntity<ErrorResponse> handleLoginFailed(LoginFailedException e){
        //401에러
        HttpStatus status = HttpStatus.UNAUTHORIZED;

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                e.getMessage()
        );
        return ResponseEntity
                .status(status)
                .body(errorResponse);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlerUserNotFound(UserNotFoundException e){
        //404에러
        HttpStatus status = HttpStatus.NOT_FOUND;

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                e.getMessage()
        );
        return ResponseEntity
                .status(status)
                .body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception e){
        //500에러
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                "서버 내부 오류 발생"
                );
        return ResponseEntity
                .status(status)
                .body(errorResponse);
    }

}
