package com.example.filetask.repository;

import com.example.filetask.entity.QUser;
import com.example.filetask.entity.User;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UserQueryRepository{
    private final JPAQueryFactory jpaQueryFactory;
    //생성자 생성
    public UserQueryRepository(JPAQueryFactory jpaQueryFactory){
        this.jpaQueryFactory = jpaQueryFactory;
    }

    //조회 버튼
    public List<User> findAllUsers(){
        QUser user = QUser.user;

        return jpaQueryFactory
                .selectFrom(user)
                .fetch();
    }

    //콤보박스로 특정 조회
    public List<User> searchUsers(String field, String keyword){
        QUser user = QUser.user;


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



    //Swagger에서만 사용한다.
    public Optional<User> findById(String id){
        QUser user = QUser.user;

        return Optional.ofNullable(jpaQueryFactory
                .selectFrom(user)
                .where(user.id.eq(id))
                .fetchOne());
    }

}
