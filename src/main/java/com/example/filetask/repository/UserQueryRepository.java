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

    //생성자 생성
    public UserQueryRepository(JPAQueryFactory jpaQueryFactory) {
        this.jpaQueryFactory = jpaQueryFactory;
    }

    //조회 버튼
    public List<User> findAllUsers() {
        QUser user = QUser.user;

        return jpaQueryFactory
                .selectFrom(user)
                .fetch();
    }

    //조건 생성/조건 실행/조회 실행 분리
    //검색 조건 생성
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

    //콤보박스로 특정 조회
    //검색 실행
    public List<User> searchUsers(String field, String keyword) {
        QUser user = QUser.user;

        BooleanExpression condition = searchCondition(field, keyword);

        if (condition == null) {
            return List.of();
        }
        //searchCondition이 null을 리턴해서 바로 넣기보단 condition을 만들고 넣는 방식이 좋다.
        return jpaQueryFactory
                .selectFrom(user)
                .where(condition)
                .fetch();
    }

}
