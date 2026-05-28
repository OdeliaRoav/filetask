package com.example.filetask.service;

import com.example.filetask.dto.FileUserResponse;
import com.example.filetask.entity.FileUser;
import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import com.example.filetask.repository.UserQueryRepository;
import com.example.filetask.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class UserService {
    // 조회, 삭제 담당
    private final UserRepository userRepository;
    private final UserQueryRepository userQueryRepository;

    // Grid 전체 조회
    // Controller는 요청 받고 실제 조회 방식은 QueryDSL Repository에 보낸다.
    public List<FileUserResponse> getAllUsers() {
        return userQueryRepository.findAllUsers()
                .stream()
                .map(FileUserResponse::user)
                .toList();
    }

    // Grid 조건 검색
    // field/keyword를 그대로 Repository로 넘겨 검색 조건 생성 책임을 한 곳에 둔다.
    public List<FileUserResponse> searchUsers(String field, String keyword) {
        return userQueryRepository.searchUsers(field, keyword)
                .stream()
                .map(FileUserResponse::user)
                .toList();
    }

    // ID 기준 삭제 처리
    // 삭제 대상이 없으면 업무 예외로 표현하고, 응답 상태코드 변환은 GlobalExceptionHandler가 담당
    public void deleteById(String id) {
        FileUser fileUser = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.DELETE_USER_NOT_FOUND));
        userRepository.delete(fileUser);
    }

}










//    private LocalDateTime parseRegDate(String value){
//        try{
//            return LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
//        }catch (DateTimeParseException e){
//            throw new BusinessException(ErrorCode.INVALID_DATE_FORMAT);
//        }
//    }


