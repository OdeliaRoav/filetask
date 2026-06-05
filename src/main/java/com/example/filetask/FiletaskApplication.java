package com.example.filetask;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FiletaskApplication {

    // SpringApplication.run : 스프링 전체를 실행
    // 스프링 컨테이너 실행
    public static void main(String[] args) {
        SpringApplication.run(FiletaskApplication.class, args);
    }

}
