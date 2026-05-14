package com.example.filetask.dto;

import lombok.Getter;

@Getter
public class LoginRequest {

    private final String id;
    private final String pwd;

    public LoginRequest(String id, String pwd) {
        this.id = id;
        this.pwd = pwd;
    }
}
