package com.example.filetask.config;

import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QueryDslConfig {

    // EntityManager는 JPA가 DB와 엔티티를 연결할 때 사용하는 핵심 객체이다.
    // QueryDSL의 JPAQueryFactory도 내부적으로 EntityManager를 사용해서 동적 쿼리를 만든다.
    @PersistenceContext
    private EntityManager entityManager;

    public QueryDslConfig() {

    }

    // QueryDSL 쿼리 생성을 위한 JPAQueryFactory Bean 등록
    // Repository에서 매번 new로 만들지 않고 Spring Bean으로 주입받아 재사용하기 위해 설정한다.
    @Bean
    public JPAQueryFactory jpaQueryFactory() {
        return new JPAQueryFactory(this.entityManager);
    }
}
