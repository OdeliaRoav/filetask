package com.example.filetask.service;

import com.example.filetask.dto.FileUserResponse;
import com.example.filetask.entity.FileUser;
import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import com.example.filetask.repository.UserQueryRepository;
import com.example.filetask.repository.UserRepository;
import com.example.filetask.repository.UserSearchField;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class UserService {
    // 조회, 삭제 담당 Repository를 주입받는다.
    private final UserRepository userRepository;
    private final UserQueryRepository userQueryRepository;

    // Grid 전체 조회
    // Controller의 요청을 받아 QueryDSL Repository에서 조회한 뒤 응답 DTO로 변환한다.
    public List<FileUserResponse> getAllUsers() {
        return userQueryRepository.findAllUsers()
                .stream()
                .map(FileUserResponse::user)
                .toList();
    }

    // Grid 조건 검색
    // Service는 검색 요청을 Repository에 전달하고, 검색 필드 검증과 조건 생성은 Repository 계층에 맡긴다.
    public List<FileUserResponse> searchUsers(String field, String keyword) {
        UserSearchField searchField = UserSearchField.from(field);

        return userQueryRepository.searchUsers(searchField, keyword)
                .stream()
                .map(FileUserResponse::user)
                .toList();
    }

    // ID 기준 삭제 처리
    // 삭제 대상이 없으면 업무 예외로 표현하고, 응답 상태코드 변환은 GlobalExceptionHandler가 담당한다.
    public void deleteById(String id) {
        FileUser fileUser = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.DELETE_USER_NOT_FOUND));
        userRepository.delete(fileUser);
    }

}
