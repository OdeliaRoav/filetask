package com.example.filetask.controller;

import com.example.filetask.entity.Info;
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

    @GetMapping
    public List<User> getAllUsers(){
        return userService.getAllUsers();
    }

    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String field, @RequestParam String keyword){
        return userService.searchUsers(field, keyword);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Info user){
        userService.signup(user);
        return ResponseEntity.ok("회원가입 성공");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Info user){
        Info loginUser = userService.login(user.getId(), user.getPwd());
        return ResponseEntity.ok(loginUser);
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public Map<String, Object> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam(value = "force", defaultValue = "false") boolean force) throws IOException {
        return userService.uploadFile(file, force);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        return userService.deleteById(id);
    }

    @DeleteMapping
    public ResponseEntity<String>  deleteAllUsers() { return userService.deleteAllUsers(); };

    @DeleteMapping("/cell")
    public ResponseEntity<String> deleteCell(@RequestParam("rowId") String rowId, @RequestParam("colId") String colId) throws IOException {
        return userService.deleteCell(rowId, colId);
    }


    //Swagger 테스트 용
    @GetMapping("/{id}")
    public Optional<User> getUser(@PathVariable String id){
        return userService.findById(id);
    }
}

