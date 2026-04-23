package com.example.filetask.controller;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/redis")
public class RedisController {

    private final RedisTemplate<String, String> redisTemplate;

    public RedisController(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @PostMapping("/test")
    public Map<String, Object> save(@RequestParam String key, @RequestParam String value) {
        redisTemplate.opsForValue().set(key, value, Duration.ofMinutes(5));

        return Map.of(
                "key", key,
                "value", value,
                "ttlSeconds", 300
        );
    }

    @GetMapping("/test")
    public Map<String, Object> get(@RequestParam String key) {
        return Map.of(
                "key", key,
                "value", redisTemplate.opsForValue().get(key),
                "ttlSeconds", redisTemplate.getExpire(key)
        );
    }

    @DeleteMapping("/test")
    public Map<String, Object> delete(@RequestParam String key) {
        return Map.of(
                "key", key,
                "deleted", redisTemplate.delete(key)
        );
    }
}
