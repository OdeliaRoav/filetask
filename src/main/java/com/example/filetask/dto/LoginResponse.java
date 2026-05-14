package com.example.filetask.dto;

import lombok.Getter;

@Getter
public class LoginResponse {

    private final String id;
    private final String name;

    public LoginResponse(String id, String name){
        this.id = id;
        this.name = name;
    }


}
