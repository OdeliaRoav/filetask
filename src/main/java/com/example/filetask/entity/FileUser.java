package com.example.filetask.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@AllArgsConstructor
@Table(name = "t_user")
public class FileUser {

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

    protected FileUser(){
    }

}
