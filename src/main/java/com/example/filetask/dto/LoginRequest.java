package com.example.filetask.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class LoginRequest {

    //NotBlank로 발생 시키는 에러 MethodArgumentNotValidException
    @NotBlank
    @Size(max = 16)
    private final String id;
    @NotBlank
    @Size(max = 32)
    private final String pwd;

    public LoginRequest(String id, String pwd) {
        this.id = id;
        this.pwd = pwd;
    }
}
