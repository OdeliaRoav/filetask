package com.example.filetask.dto;

import com.example.filetask.entity.FileUser;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@AllArgsConstructor (access = AccessLevel.PRIVATE)
@Getter
public class FileUserResponse {
    private String id;
    private String pwd;
    private String name;
    private String level;
    private String desc;
    private LocalDateTime regDate;

    public static FileUserResponse user(FileUser fileUser) {
        return new FileUserResponse(
                fileUser.getId(),
                fileUser.getPwd(),
                fileUser.getName(),
                fileUser.getLevel(),
                fileUser.getDesc(),
                fileUser.getRegDate()
                );

    }
}
