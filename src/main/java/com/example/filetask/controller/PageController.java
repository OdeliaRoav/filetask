package com.example.filetask.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    // 로그인 페이지 로드
    // JSP 화면 이름을 반환해서 ViewResolver가 /WEB-INF/views/login/login.jsp를 찾도록 한다.
    @GetMapping("/login")
    public String loginPage() {
        return "login/login";
    }

    // 업로드 페이지 로드
    // 과제의 파일 업로드 화면으로 이동할 때 사용하는 진입점이다.
    @GetMapping("/upload")
    public String uploadPage() {
        return "upload/upload";
    }

    // 회원가입 페이지 로드
    // 회원 정보를 입력하는 JSP 화면 이름을 반환한다.
    @GetMapping("/signup")
    public String signupPage() {
        return "signup/signup";
    }
}
