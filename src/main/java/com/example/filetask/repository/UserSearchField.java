package com.example.filetask.repository;

import com.example.filetask.entity.QFileUser;
import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import com.querydsl.core.types.dsl.BooleanExpression;

import java.util.Arrays;

public enum UserSearchField {
    ID("id"){
        @Override
        public BooleanExpression condition(QFileUser fileUser, String keyword){
            return fileUser.id.containsIgnoreCase(keyword);
        }
    },
    NAME("name"){
        @Override
        public BooleanExpression condition(QFileUser fileUser, String keyword){
            return fileUser.name.containsIgnoreCase(keyword);
        }
    },
    LEVEL("level"){
        @Override
        public BooleanExpression condition(QFileUser fileUser, String keyword){
            return fileUser.level.containsIgnoreCase(keyword);
        }
    },
    DESC("desc"){
        @Override
        public BooleanExpression condition(QFileUser fileUser, String keyword){
            return fileUser.desc.containsIgnoreCase(keyword);
        }
    };

    private final String field;

    UserSearchField(String field){
        this.field = field;
    }


    public abstract BooleanExpression condition(QFileUser fileUser, String keyword);

    public static UserSearchField from(String field){
        return Arrays.stream(values())
                .filter(searchField -> searchField.equals(field))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INPUT_VALUE));
    }


}
