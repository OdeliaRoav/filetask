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

    // Controller는 요청과 응답을 담당하고, 실제 처리 로직은 UserService에 위임한다.
    // 생성자 주입을 사용하면 필요한 의존성이 명확하고 테스트할 때 Mock Service를 넣기 쉽다.
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 전체 사용자 조회 요청
    // DB 조회 자체는 Service와 Repository에서 처리하고, Controller는 조회 결과를 JSON으로 반환한다.
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // 검색 조건 조회 요청
    // field는 검색 기준, keyword는 검색어이며 실제 QueryDSL 조건 생성은 Repository에서 처리한다.
    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String field, @RequestParam String keyword) {
        return userService.searchUsers(field, keyword);
    }

    // 회원가입 요청
    // 중복 아이디 같은 실패 상황은 Service에서 custom exception으로 던지고 GlobalExceptionHandler가 응답한다.
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Info user) {
        userService.signup(user);
        return ResponseEntity.ok("회원가입 성공");
    }

    // 로그인 요청
    // 아이디 없음, 비밀번호 불일치는 Service에서 각각 LOGIN_ID_NOT_FOUND, INVALID_PASSWORD ErrorCode로 처리한다.
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Info user) {
        Info loginUser = userService.login(user.getId(), user.getPwd());
        return ResponseEntity.ok(loginUser);
    }

    // dbfile 업로드 요청
    // multipart/form-data 형식으로 전달된 파일을 Service에 넘기고, 업로드 결과를 JSON 형태로 반환한다.
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public Map<String, Object> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam(value = "force", defaultValue = "false") boolean force) throws IOException {
        return userService.uploadFile(file, force);
    }

    // ID 기준 사용자 삭제 요청
    // Controller는 정상 처리 응답만 만들고, 삭제 대상이 없는 예외는 GlobalExceptionHandler가 404로 변환한다.
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        // 이렇게 하면 Controller마다 반복되는 try-catch와 상태코드 분기 코드를 줄일 수 있다.
        userService.deleteById(id);
        return ResponseEntity.ok("삭제");
    }

    // 전체 사용자 삭제 요청
    // 전체 삭제 자체는 Service에서 수행하고, HTTP 성공 응답은 Controller에서 만든다.
    @DeleteMapping
    public ResponseEntity<String> deleteAllUsers() {
        userService.deleteAllUsers();
        return ResponseEntity.ok("전체 삭제");
    }

    // 셀 값 삭제 요청
    // rowId 없음, 잘못된 colId 같은 실패 상황은 Service가 BusinessException과 ErrorCode로 표현한다.
    @DeleteMapping("/cell")
    public ResponseEntity<String> deleteCell(@RequestParam("rowId") String rowId, @RequestParam("colId") String colId) {
        // Controller는 성공 응답만 담당하고, 실패 응답 형식은 GlobalExceptionHandler에서 일관되게 관리한다.
        userService.deleteCell(rowId, colId);
        return ResponseEntity.ok("셀 삭제");
    }

    // Swagger 단건 조회 테스트용
    // 화면 주요 기능은 아니지만 API 문서에서 단건 조회 결과를 확인하기 위해 둔다.
    @GetMapping("/{id}")
    public Optional<User> getUser(@PathVariable String id) {
        return userService.findById(id);
    }
}
