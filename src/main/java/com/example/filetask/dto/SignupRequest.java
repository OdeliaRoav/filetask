package com.example.filetask.dto;

import com.example.filetask.entity.Info;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class SignupRequest {

    @NotBlank
    @Size(max = 16)
    private String id;
    @NotBlank
    @Size(max = 32)
    private String pwd;
    @NotBlank
    @Size(max = 32)
    private String name;

    public SignupRequest(String id, String pwd, String name) {
        this.id = id;
        this.pwd = pwd;
        this.name = name;
    }

    public Info newInfo(){
        return new Info(id, pwd, name);
    }
}
