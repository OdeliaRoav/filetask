package com.example.filetask.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "t_user")

public class User {

    @Id
    private String id;
    private String pwd;
    private String name;
    private String level;

    @Column(name = "description")
    private String desc;

    @Column(name = "reg_date")
    private LocalDateTime regDate;

    @Builder
    public User(String id, String pwd, String name, String level,
                String description, LocalDateTime reg_date) {
        this.id = id;
        this.pwd = pwd;
        this.name = name;
        this.level = level;
        this.desc = description;
        this.regDate = reg_date;

    }
}