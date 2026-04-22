package com.example.filetask.controller;

import com.example.filetask.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public Map<String, Object> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        return userService.uploadFile(file);
    }
}