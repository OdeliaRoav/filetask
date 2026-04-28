package com.example.filetask.controller;

import com.example.filetask.entity.User;
import com.example.filetask.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public Map<String, Object> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam(value = "force", defaultValue = "false") boolean force) throws IOException {
        return userService.uploadFile(file, force);
    }

    //Swagger
    @GetMapping("/{id}")
    public Optional<User> getUser(@PathVariable String id){
        return userService.findById(id);
    }

    @GetMapping
    public List<User> getAllUsers(){
        return userService.getAllUsers();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        return userService.deleteById(id);
    }

    @DeleteMapping
    public ResponseEntity<String>  deleteAllUsers() { return userService.deleteAllUsers(); };

}