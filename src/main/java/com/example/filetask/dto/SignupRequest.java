package com.example.filetask.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// get메서드 자동 생성
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SignupRequest {

    // @Emial -> 이메일 검증
    @NotBlank
    @Email
    @Size(max = 16)
    private String id;
    @NotBlank
    @Size(max = 32)
    private String pwd;
    @NotBlank
    @Size(max = 32)
    private String name;

}
