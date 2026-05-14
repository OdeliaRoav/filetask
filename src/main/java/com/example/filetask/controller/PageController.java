package com.example.filetask.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    // 로그인 JSP 화면 진입점
    @GetMapping("/login")
    public String loginPage() {
        return "login/login";
    }

    // 업로드 JSP 화면 진입점
    @GetMapping("/upload")
    public String uploadPage() {
        return "upload/upload";
    }

    // 회원가입 JSP 화면 진입점
    @GetMapping("/signup")
    public String signupPage() {
        return "signup/signup";
    }
}
