package com.example.filetask.repository;

import com.example.filetask.entity.QUser;
import com.example.filetask.entity.User;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

//직접 구현해야함 JpaRepository의 경우 기본 기능을 제공하지만,
//UserQueryRepository의 경우 직접 구현해야하기에 Class로 한다.

@Repository
public class UserQueryRepository{
    private final JPAQueryFactory jpaQueryFactory;

    public UserQueryRepository(JPAQueryFactory jpaQueryFactory){
        this.jpaQueryFactory = jpaQueryFactory;
    }

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
                .fetch(); //조회 실행
    }



}