package com.example.filetask.repository;

import com.example.filetask.entity.QUser;
import com.example.filetask.entity.User;
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
    // 업로드 화면의 Grid에 표시할 사용자 데이터를 QueryDSL로 조회한다.
    public List<User> findAllUsers() {
        QUser user = QUser.user;

        return jpaQueryFactory
                .selectFrom(user)
                .fetch();
    }

    // 검색 조건 생성
    // field 값에 따라 QueryDSL BooleanExpression을 만들고, 유효하지 않은 조건은 null로 반환
    private BooleanExpression searchCondition(String field, String keyword) {
        QUser user = QUser.user;

        if (field == null || keyword == null || keyword.isBlank()) {
            return null;
        }

        return switch (field) {
            case "id" -> user.id.containsIgnoreCase(keyword);
            case "name" -> user.name.containsIgnoreCase(keyword);
            case "level" -> user.level.containsIgnoreCase(keyword);
            case "desc" -> user.desc.containsIgnoreCase(keyword);
            default -> null;
        };
    }

    // 조건 검색 실행
    // 화면 콤보박스에서 선택한 검색 기준과 검색어를 받아 조건에 맞는 row만 조회
    public List<User> searchUsers(String field, String keyword) {
        QUser user = QUser.user;

        BooleanExpression condition = searchCondition(field, keyword);

        if (condition == null) {
            return List.of();
        }
        // 조건을 변수로 분리해 null 여부를 먼저 판단하면 where(null) 호출보다 검색 실패 흐름이 명확
        return jpaQueryFactory
                .selectFrom(user)
                .where(condition)
                .fetch();
    }

}
