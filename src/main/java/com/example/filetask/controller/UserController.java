package com.example.filetask.controller;

import com.example.filetask.dto.LoginRequest;
import com.example.filetask.dto.SignupRequest;
import com.example.filetask.entity.Info;
import com.example.filetask.entity.User;
import com.example.filetask.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    //UserController가 동작하려면 UserService가 필요하고, Spring이 생성자를 통해 UserService를 자동으로 넣어주도록 한다.
    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers(){
        return userService.getAllUsers();
    }

    // RequestParam은 URL 파라미터나 FormData의 개별 값을 받아오는 방식
    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String field, @RequestParam String keyword){
        return userService.searchUsers(field, keyword);
    }

    // RequestBody는 HTTP 요청의 본문에 들어 있는 JSON 데이터를 자바 객체로 변환하는 방식
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequest signupRequest){
        userService.signup(signupRequest.getId(), signupRequest.getPwd(), signupRequest.getName());
        //객체를 돌려도 사용할 곳이 없기에 그냥 build사용해서 빈 JSON을 전송한다.
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@RequestBody LoginRequest request){
        userService.login(request.getId(), request.getPwd());
        //200 ok, 빈 JSON 전송
        return ResponseEntity.ok().build();
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


}

