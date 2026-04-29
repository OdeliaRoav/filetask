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
    @GetMapping("/upload")
    public String uploadPage() {
        return "upload/upload";
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public String uploadFile(@RequestParam("file") MultipartFile file,
                             @RequestParam(value = "force", defaultValue = "false") boolean force,
                             Model model) throws IOException {
        Map<String, Object> result = userService.uploadFile(file, force);
        model.addAttribute("result", result);
        return "upload/upload";

    }
}
