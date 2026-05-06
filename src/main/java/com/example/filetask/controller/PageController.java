package com.example.filetask.controller;

import com.example.filetask.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Controller
public class PageController {

    private final UserService userService;

    public PageController(UserService userService) {
        this.userService = userService;
    }

    //페이지 로드
    @GetMapping("/login")
    public String loginPage() {
        return "login/login";
    }
    //페이지 로드
    @GetMapping("/upload")
    public String uploadPage() {
        return "upload/upload";
    }
    //페이지 로드
    @GetMapping("/signup")
    public String signupPage(){
        return "signup/signup";
    }


}
