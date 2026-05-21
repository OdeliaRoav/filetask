package com.example.filetask.entity;

import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
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
@Table(name = "Info")
public class Info {

    @Id
    @Column(length = 16, nullable = false)
    private String id;

    @Column(length = 32, nullable = false)
    private String pwd;

    @Column(length = 32, nullable = false)
    private String name;

    // 아무데서나 생성자를 만들지 못하게 protected로 막는다.
    protected Info(){
    }

    public Info(String id, String pwd, String name){
        if(id == null || id.isBlank()){
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
        if(pwd == null || pwd.isBlank()){
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
        if(name == null || name.isBlank()){
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        this.id = id;
        this.pwd = pwd;
        this.name = name;
    }

}
