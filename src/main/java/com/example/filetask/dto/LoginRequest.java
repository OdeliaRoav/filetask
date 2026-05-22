package com.example.filetask.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {

    //NotBlank로 발생 시키는 에러 MethodArgumentNotValidException
    //null, 빈 값, 공백을 막는다. -> 문자열 검증에 주로 사용
    @NotBlank
    @Email
    @Size(max = 16)
    private String id;
    @NotBlank
    @Size(max = 32)
    private String pwd;

}
