package com.example.filetask.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    //로그인 페이지 로드
    @GetMapping("/login")
    public String loginPage() {
        return "login/login";
    }

    //업로드 페이지 로드
    @GetMapping("/upload")
    public String uploadPage() {
        return "upload/upload";
    }

    //회원가입 페이지 로드
    @GetMapping("/signup")
    public String signupPage() {
        return "signup/signup";
    }
}
