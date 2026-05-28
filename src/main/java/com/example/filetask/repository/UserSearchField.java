package com.example.filetask.repository;

import com.example.filetask.entity.QFileUser;
import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import com.querydsl.core.types.dsl.BooleanExpression;

import java.util.Arrays;

// Grid 검색에서 허용하는 검색 필드와 각 필드별 QueryDSL 조건을 한 곳에서 관리한다.
// 검색 필드가 추가될 때 Service와 Repository의 하드코딩 목록을 각각 수정하지 않기 위한 enum이다.
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

    // 화면에서 전달되는 field 문자열과 enum을 연결하기 위한 값
    UserSearchField(String field){
        this.field = field;
    }


    // 각 검색 필드가 자신에게 맞는 QueryDSL 조건을 직접 만든다.
    public abstract BooleanExpression condition(QFileUser fileUser, String keyword);

    // 요청으로 들어온 field 문자열이 허용된 검색 필드인지 확인하고 enum으로 변환한다.
    public static UserSearchField from(String field){
        return Arrays.stream(values())
                .filter(searchField -> searchField.field.equals(field))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INPUT_VALUE));
    }


}
