package com.example.filetask.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "t_user")
public class User {

    @Id
    @Column(length = 16, nullable = false)
    private String id;

    @Column(length = 32, nullable = false)
    private String pwd;

    @Column(length = 128, nullable = false)
    private String name;

    @Column(length = 1, nullable = false)
    private String level;

    @Column(name = "description", length = 256)
    private String desc;

    @Column(name = "reg_date", nullable = false)
    private LocalDateTime regDate;

    public User(String id, String pwd, String name, String level, String description, LocalDateTime reg_date) {
        this.id = id;
        this.pwd = pwd;
        this.name = name;
        this.level = level;
        this.desc = description;
        this.regDate = reg_date;
    }
}
