package com.example.filetask.service;

import com.example.filetask.dto.LoginRequest;
import com.example.filetask.dto.SignupRequest;
import com.example.filetask.entity.Info;
import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import com.example.filetask.repository.InfoRepository;
import org.springframework.stereotype.Service;

@Service
public class InfoService {

    private final InfoRepository infoRepository;

    public InfoService(InfoRepository infoRepository){
        this.infoRepository = infoRepository;
    }

    // 회원가입 처리
    // 아이디 중복 여부를 먼저 확인한 뒤 Info 엔티티 생성 규칙을 통해 저장
    public void signup(SignupRequest request) {
        if(infoRepository.existsById(request.getId())){
            throw new BusinessException(ErrorCode.DUPLICATE_USER);
        }

        Info signupUser = new Info(request.getId(), request.getPwd(), request.getName());
        infoRepository.save(signupUser);
    }

    // 로그인 처리
    // 아이디 존재 여부와 비밀번호 불일치를 다른 ErrorCode로 구분해 화면 메시지를 표현
    public void login(LoginRequest request) {
        if (isBlank(request.getId()) || isBlank(request.getPwd())) {
            throw new BusinessException(ErrorCode.REQUIRED_VALUE_EMPTY);
        }
        //JPA findById -> Optional로 .orElseThrow() 사용
        Info user = infoRepository.findById(request.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.LOGIN_ID_NOT_FOUND));

        if (!user.getPwd().equals(request.getPwd())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }
    }

    //값이 null이거나, 아예 없거나.
    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }


}
