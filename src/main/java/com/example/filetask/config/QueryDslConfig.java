package com.example.filetask.config;

//JPAQueryFactory로 QueryDSL을 사용
//JPA의 엔티티를 이용해 쿼리를 쉽게 사용할 수 있는 도구라고 한다.

import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QueryDslConfig {
    @PersistenceContext
    private EntityManager entityManager;

    public QueryDslConfig(){

    }

    @Bean
    public JPAQueryFactory jpaQueryFactory(){
        return new JPAQueryFactory(this.entityManager);
    }

}
