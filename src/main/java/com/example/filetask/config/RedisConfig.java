package com.example.filetask.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

// Redis 데이터베이스에 접근하기 위한 설정
// 이 프로젝트에서는 같은 파일명을 5분 동안 중복 업로드하지 않도록 Redis에 임시 키를 저장한다.
@Configuration
public class RedisConfig {

    // application.properties에 있는 Redis host 값을 주입받는다.
    @Value("${spring.data.redis.host}")
    private String host;

    // application.properties에 있는 Redis port 값을 주입받는다.
    @Value("${spring.data.redis.port}")
    private int port;

    // Redis 서버와 연결하기 위한 ConnectionFactory Bean 등록
    // LettuceConnectionFactory는 Spring Data Redis에서 Redis 연결을 생성할 때 사용하는 구현체이다.
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(host, port);
    }

    // Redis에 문자열 key/value를 저장하기 위한 RedisTemplate Bean 등록
    // 파일명 중복 체크처럼 단순 문자열 데이터를 저장하므로 key와 value 모두 String 직렬화 방식을 사용한다.
    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, String> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory);
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new StringRedisSerializer());
        return redisTemplate;
    }
}
