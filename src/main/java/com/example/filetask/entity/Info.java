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

    // 아무곳에서나 생성자를 만들지 못하게 protected로 막는다.
    protected Info(){
    }

    public Info(String id, String pwd, String name){
        validateRequired(id);
        validateRequired(pwd);
        validateRequired(name);

        this.id = id;
        this.pwd = pwd;
        this.name = name;
    }

    private void validateRequired(String value){
        if(value == null || value.isBlank()){
            throw new BusinessException(ErrorCode.REQUIRED_VALUE_EMPTY);
        }
    }

}
