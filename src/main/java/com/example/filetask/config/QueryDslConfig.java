package com.example.filetask.config;

import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QueryDslConfig {
    // QueryDSL은 JPA EntityManager를 기반으로 타입 안전한 쿼리를 생성
    @PersistenceContext
    private EntityManager entityManager;

    // Repository에서 JPAQueryFactory를 주입받아 동적 검색 쿼리를 일관된 방식으로 만들 수 있게 한다.
    @Bean
    public JPAQueryFactory jpaQueryFactory() {
        return new JPAQueryFactory(this.entityManager);
    }
}
