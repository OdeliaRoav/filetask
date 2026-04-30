package com.example.filetask.entity;

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
    private String id;
    private String pwd;
    private String name;


    //builder로 묶어봤는데 오류 터져서 객체로 묶는게 나을듯
    public static Info signup(String id, String pwd, String name){
        Info info = new Info();
        info.id = id;
        info.pwd = pwd;
        info.name = name;
        return info;
    }



}


