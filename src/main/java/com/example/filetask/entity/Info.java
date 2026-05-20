package com.example.filetask.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "Info")
public class Info {

    @Id
    @Column(length = 16, nullable = false)
    private String id;

    @Column(length = 32, nullable = false)
    private String pwd;

    @Column(length = 32, nullable = false)
    private String name;

}
