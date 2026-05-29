package com.example.filetask.repository;

import com.example.filetask.entity.FileUser;
import com.example.filetask.entity.QFileUser;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class UserQueryRepository {
    private final JPAQueryFactory jpaQueryFactory;

    // QueryDSL 쿼리 생성을 위해 설정 클래스에서 만든 JPAQueryFactory를 주입받는다.
    public UserQueryRepository(JPAQueryFactory jpaQueryFactory) {
        this.jpaQueryFactory = jpaQueryFactory;
    }

    // 전체 조회
    // 업로드 화면 Grid에 표시할 사용자 데이터를 QueryDSL로 조회한다.
    public List<FileUser> findAllUsers() {
        QFileUser fileUser = QFileUser.fileUser;

        return jpaQueryFactory
                .selectFrom(fileUser)
                .fetch();
    }

    // 검색 조건 생성
    // field 값 검증과 QueryDSL 조건 생성은 UserSearchField enum에 위임한다.
    private BooleanExpression searchCondition(UserSearchField searchField, String keyword) {
        QFileUser fileUser = QFileUser.fileUser;

        if (searchField == null || keyword == null || keyword.isBlank()) {
            return null;
        }

        return searchField.condition(fileUser, keyword);
    }

    // 조건 검색 실행
    // 화면 콤보박스에서 선택한 검색 기준과 검색어를 받아 조건에 맞는 row만 조회한다.
    public List<FileUser> searchUsers(UserSearchField searchField, String keyword) {
        QFileUser fileUser = QFileUser.fileUser;

        BooleanExpression condition = searchCondition(searchField, keyword);

        // 생성된 조건을 where 절에 넣어 QueryDSL 조회를 수행한다.
        return jpaQueryFactory
                .selectFrom(fileUser)
                .where(condition)
                .fetch();
    }

}
