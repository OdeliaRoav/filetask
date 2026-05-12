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
        userService.deleteById(id);
        return ResponseEntity.ok("검색 삭제");
    }

    @DeleteMapping
    public ResponseEntity<String>  deleteAllUsers() {
        userService.deleteAllUsers();
        return ResponseEntity.ok("전체 삭제");
    };

    @DeleteMapping("/cell")
    public ResponseEntity<String> deleteCell(@RequestParam("rowId") String rowId, @RequestParam("colId") String colId) {
        userService.deleteCell(rowId, colId);
        return ResponseEntity.ok("셀 삭제");
    }

}

