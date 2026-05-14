package com.example.filetask.exception;

// Service 계층에서 의도적으로 발생시키는 업무 예외
// 실패 종류와 HTTP 상태 기준은 ErrorCode에 두고, 이 클래스는 예외 전달 역할만 담당
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        // RuntimeException message에도 기본 메시지를 넣어 로그와 디버깅에서 실패 이유가 보이게 한다.
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
