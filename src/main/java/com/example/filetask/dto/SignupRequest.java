package com.example.filetask.dto;

import com.example.filetask.entity.Info;
import lombok.Getter;

@Getter
public class SignupRequest {

    private final String id;
    private final String pwd;
    private final String name;

    public SignupRequest(String id, String pwd, String name) {
        this.id = id;
        this.pwd = pwd;
        this.name = name;
    }

    public Info newInfo(){
        return new Info(id, pwd, name);
    }
}
