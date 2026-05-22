package com.example.filetask.entity;

import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "t_user")
public class FileUser {

    // nullable -> DB 제약조건으로 요청겂 검증이 아니다.
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

    //아무곳에서나 객체를 생성하지 못하게 막는다.
    protected FileUser(){
    }

    public FileUser(String id, String pwd, String name, String  level, String desc, LocalDateTime regDate) {
        validateRequired(id);
        validateRequired(pwd);
        validateRequired(name);
        validateRequired(level);
        validateRequired(desc);

        if(regDate == null){
            throw new BusinessException(ErrorCode.REQUIRED_VALUE_EMPTY);
        }

        this.id = id;
        this.pwd = pwd;
        this.name = name;
        this.level = level;
        this.desc = desc;
        this.regDate = regDate;
    }

    private void validateRequired(String value){
        if (value == null || value.isEmpty()) {
            throw new BusinessException(ErrorCode.REQUIRED_VALUE_EMPTY);
        }
    }

}
