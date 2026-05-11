package com.example.filetask.repository;

import com.example.filetask.entity.QUser;
import com.example.filetask.entity.User;
import com.querydsl.core.QueryFactory;
import com.querydsl.core.types.dsl.BooleanExpression;
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

        BooleanExpression condition = searchCondition(field, keyword);

        if(condition == null){
            return List.of();
        }

        return jpaQueryFactory
                .selectFrom(user)
                .where(searchCondition(field, keyword))
                .fetch();
    }

    private BooleanExpression searchCondition(String field, String keyword){
        QUser user = QUser.user;

        if(field == null || keyword == null || keyword.isBlank()){
            return null;
        }

        return switch (field){
            case "id" -> user.id.containsIgnoreCase(keyword);
            case "name" -> user.name.containsIgnoreCase(keyword);
            case "level" -> user.level.containsIgnoreCase(keyword);
            case "desc" -> user.desc.containsIgnoreCase(keyword);
            default -> null;
        };
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


//    public List<User> searchUsers(String field, String keyword){
//        QUser user = QUser.user;
//
//        //할 일 : 중복되는 코드들 줄여서 동적으로 검색하는 기능 추가해야함
//        //대소 무시하고 문자열 있는지 확인
//        if("id".equals(field)){
//            return jpaQueryFactory
//                    .selectFrom(user)
//                    .where(user.id.containsIgnoreCase(keyword))
//                    .fetch();
//        }
//
//        if("name".equals(field)){
//            return jpaQueryFactory
//                    .selectFrom(user)
//                    .where(user.name.containsIgnoreCase(keyword))
//                    .fetch();
//        }
//
//        if("level".equals(field)){
//            return jpaQueryFactory
//                    .selectFrom(user)
//                    .where(user.level.containsIgnoreCase(keyword))
//                    .fetch();
//        }
//
//        if("desc".equals(field)){
//            return jpaQueryFactory
//                    .selectFrom(user)
//                    .where(user.desc.containsIgnoreCase(keyword))
//                    .fetch();
//        }
//
//        return List.of();
//    }