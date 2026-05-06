package com.example.filetask.repository;

import com.example.filetask.entity.QUser;
import com.example.filetask.entity.User;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.lang.reflect.Array;
import java.util.List;
import java.util.Optional;

//직접 구현해야함 JpaRepository의 경우 기본 기능을 제공하지만,
//UserQueryRepository의 경우 직접 구현해야하기에 Class로 한다.
@RequiredArgsConstructor

@Repository
public class UserQueryRepository{
    private final JPAQueryFactory jpaQueryFactory;

    public Optional<User> findById(String id){
        QUser user = QUser.user;

        return Optional.ofNullable(jpaQueryFactory
                .selectFrom(user)
                .where(user.id.eq(id))
                .fetchOne());

    }

    public List<User> findAllUsers(){
        QUser user = QUser.user;

        return jpaQueryFactory
                .selectFrom(user)
                .fetch();
    }

    public List<User> searchUsers(String field, String keyword){
        QUser user = QUser.user;

        if(keyword == null || keyword.isBlank()){
            return findAllUsers();
        }

        //대소 무시하고 문자열 있는지 확인
        if("id".equals(field)){
            return jpaQueryFactory
                    .selectFrom(user)
                    .where(user.id.containsIgnoreCase(keyword))
                    .fetch();
        }

        if("name".equals(field)){
            return jpaQueryFactory
                    .selectFrom(user)
                    .where(user.name.containsIgnoreCase(keyword))
                    .fetch();
        }

        if("level".equals(field)){
            return jpaQueryFactory
                    .selectFrom(user)
                    .where(user.level.containsIgnoreCase(keyword))
                    .fetch();
        }

        if("desc".equals(field)){
            return jpaQueryFactory
                    .selectFrom(user)
                    .where(user.desc.containsIgnoreCase(keyword))
                    .fetch();
        }

        return List.of();
    }



}
