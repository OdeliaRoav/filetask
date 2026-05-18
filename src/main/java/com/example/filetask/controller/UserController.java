package com.example.filetask.controller;

import com.example.filetask.dto.LoginRequest;
import com.example.filetask.dto.SignupRequest;
import com.example.filetask.entity.FileUser;
import com.example.filetask.service.InfoService;
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

    // Controller는 HTTP 요청/응답 경계만 담당하고, 실제 검증과 저장 로직은 UserService에서 처리
    private final UserService userService;
    private final InfoService infoService;

    public UserController(UserService userService, InfoService infoService) {
        this.userService = userService;
        this.infoService = infoService;
    }

    // 전체 사용자 조회 API
    // 업로드 화면 Grid 초기 로딩과 새로고침에서 사용하며 조회 결과를 JSON 배열로 반환
    @GetMapping
    public List<FileUser> getAllUsers() {
        return userService.getAllUsers();
    }

    // 조건 검색 API
    // field와 keyword는 URL query parameter(GET으로 전송 받음)로 받고, QueryDSL 조건 생성은 Repository 계층에서 처리
    @GetMapping("/search")
    public List<FileUser> searchUsers(@RequestParam String field, @RequestParam String keyword) {
        return userService.searchUsers(field, keyword);
    }

    // 회원가입 API
    // 요청 본문의 JSON을 SignupRequest로 받고, 중복 ID 같은 실패는 공통 예외 처리기로
    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody SignupRequest signupRequest) {
        infoService.signup(signupRequest);
        return ResponseEntity.ok().build();
    }

    // 로그인 API
    // 인증 성공 여부만 필요하므로(void) 성공 시 본문 없는 200 응답을 반환
    @PostMapping("/login")
    public ResponseEntity<Void> login(@RequestBody LoginRequest request) {
        infoService.login(request);
        return ResponseEntity.ok().build();
    }

    // dbfile 업로드 API
    // multipart/form-data 파일과 강제 업로드 여부를 Service에 전달하고 처리 결과 Map을 JSON으로 반환
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public Map<String, Object> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam(value = "force", defaultValue = "false") boolean force) throws IOException {
        return userService.uploadFile(file, force);
    }

    // ID 기준 사용자 삭제 API
    // 삭제 대상 없음 같은 업무 실패는 Service가 BusinessException으로 표현하고 전역 예외 처리기가 응답
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

