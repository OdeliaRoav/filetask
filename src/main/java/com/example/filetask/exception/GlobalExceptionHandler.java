package com.example.filetask.exception;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@Slf4j
// 전역 예외 처리기
// Controller마다 try-catch를 반복하지 않고, 모든 REST 실패 응답을 ErrorResponse JSON으로 통일
@RestControllerAdvice
public class GlobalExceptionHandler {
    // Service에서 던진 업무 예외는 ErrorCode에 정의된 상태코드와 메시지로 응답
    // 해당하는 기능에서 에러가 발생하면 여기서 받고, Exception e로 받아온다.
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        return createErrorResponse(e.getErrorCode());
    }

    // 예상하지 못한 예외는 서버 내부 오류로 일관된 응답 형식을 유지
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception e) {
        log.error("예상하지 못한 에러 : ", e);
        return createErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR);
    }

    //DTO 검증 추가
    //NotBlank로 발생 시키는 에러 MethodArgumentNotValidException
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e){
        log.error("DTO NotBlank 검증 실패 : ", e);
        return createErrorResponse(ErrorCode.INVALID_INPUT_VALUE);
    }

    //파라미터 검증
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException e){
        log.error("요청 파라미터 검증 실패 : ", e);
        return createErrorResponse(ErrorCode.INVALID_INPUT_VALUE);
    }

    //컨트롤러가 요구하는 필수 파라미터가 HTTP 요청에 누락되었을 때 발생하는 예외
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestParameterException(MissingServletRequestParameterException e){
        return createErrorResponse(ErrorCode.INVALID_INPUT_VALUE);
    }

    //JSON 파싱 오류 등으로 요청 본문을 읽을 수 없을 때 발생한다.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handlerHttpMessageNotReadableException(HttpMessageNotReadableException e){
        return createErrorResponse(ErrorCode.INVALID_INPUT_VALUE);
    }

    //devtools.json 404 에러 방지
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Void> handleNoResourcesFoundException(NoResourceFoundException e){
        return ResponseEntity.notFound().build();
    }

    // ErrorCode를 HTTP status와 응답 body로 변환하는 공통 생성 지점
    private ResponseEntity<ErrorResponse> createErrorResponse(ErrorCode errorCode) {
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ErrorResponse.of(errorCode));
    }
}
