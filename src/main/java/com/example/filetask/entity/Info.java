package com.example.filetask.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;



@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "Info")
public class Info {

    @Id
    @Column(length = 16, nullable = false)
    private String id;

    @Column(length = 32, nullable = false)
    private String pwd;

    @Column(length = 32, nullable = false)
    private String name;

    public static Info signup(String id, String pwd, String name){
        Info info = new Info();
        info.id = id;
        info.pwd = pwd;
        info.name = name;
        return info;
    }
}