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
    @NotBlank
    @Email
    @Size(max = 16)
    private String id;
    @NotBlank
    @Size(max = 32)
    private String pwd;

}
