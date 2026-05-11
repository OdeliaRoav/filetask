package com.example.filetask.repository;

import com.example.filetask.entity.QUser;
import com.example.filetask.entity.User;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UserQueryRepository {
    private final JPAQueryFactory jpaQueryFactory;

    public UserQueryRepository(JPAQueryFactory jpaQueryFactory) {
        this.jpaQueryFactory = jpaQueryFactory;
    }

    public List<User> findAllUsers() {
        QUser user = QUser.user;

        return jpaQueryFactory
                .selectFrom(user)
                .fetch();
    }

    public List<User> searchUsers(String field, String keyword) {
        QUser user = QUser.user;

        BooleanExpression condition = searchCondition(field, keyword);

        if (condition == null) {
            return List.of();
        }

        // 검색 조건을 한 번만 생성해서 불필요한 중복 호출을 막는다.
        return jpaQueryFactory
                .selectFrom(user)
                .where(condition)
                .fetch();
    }

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

    // 단건 조회 테스트용으로 사용한다.
    public Optional<User> findById(String id) {
        QUser user = QUser.user;

        return Optional.ofNullable(jpaQueryFactory
                .selectFrom(user)
                .where(user.id.eq(id))
                .fetchOne());
    }
}
