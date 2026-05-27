package com.example.filetask.service;

import com.example.filetask.entity.FileUser;
import com.example.filetask.exception.BusinessException;
import com.example.filetask.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

//Spring bean으로 등록한다 -> Service라고 명시한다.
@Service
public class FileUserParser {
    // 파일 해석 담당
    public List<String> readLines(MultipartFile file){
        List<String> lines = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))){
            String Line;
            while((Line=br.readLine())!=null){
                lines.add(Line);
            }
        }catch (IOException e){
            throw new BusinessException(ErrorCode.FILE_READ_ERROR);
        }

        return lines;
    }

    public FileUser parseLine(String oneLine){
        // 빈 컬럼도 보존[split("/", -1)]해야 컬럼 수 누락을 구분할 수 있다.
        String data[] = oneLine.split("/", -1);
        //길이가 6이 아닐 때 예외처리
        if (data.length != 6) {
            throw new BusinessException(ErrorCode.INVALID_FILE_COLUMN_COUNT);
        }
        //값이 비어있을 경우 예외처리
        if (data[0].isBlank() || data[1].isBlank() || data[2].isBlank() || data[3].isBlank() || data[5].isBlank()) {
            throw new BusinessException(ErrorCode.REQUIRED_VALUE_EMPTY);
        }
        //날짜 형식 예외처리
        LocalDateTime regDate = parseRegDate(data[5]);

        return new FileUser(
                data[0],
                data[1],
                data[2],
                data[3],
                data[4],
                regDate
        );
    }

    private LocalDateTime parseRegDate(String value){
        try{
            return LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (DateTimeParseException e){
            throw new BusinessException(ErrorCode.INVALID_DATE_FORMAT);
        }
    }
}


//            LocalDateTime regDate;
//                try {
//                    regDate = LocalDateTime.parse(data[5], DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
//                } catch (DateTimeParseException e) {
//                    throw new BusinessException(ErrorCode.INVALID_DATE_FORMAT);
//                }


