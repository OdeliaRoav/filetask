package com.example.filetask.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

//모든 필드 한 번에 초기화하는 생성자 생성
//외부에서 생성자를 만들지 못하게하며, 메서드를 통해서만 사용할 수 있게 제한
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
public class UploadResponse {
    private boolean duplicated;
    private boolean forced;
    private String message;
    private String fileName;
    private int totalCount;
    private int successCount;
    private List<String> failList;
    private int failCount;
    private long ttlSeconds;

    public static UploadResponse duplicated(String fileName, long ttlSeconds) {
        return new UploadResponse(
                true,
                false,
                "5분 안에 같은 파일명이 업로드되었습니다.",
                fileName,
                0,
                0,
                List.of(),
                0,
                ttlSeconds
        );
    }

    public static UploadResponse complete(boolean duplicated, boolean forced, String fileName, int totalCount, int successCount, List<String> failList, int failCount, long ttlSeconds){
        return new UploadResponse(
                duplicated,
                forced,
                null,
                fileName,
                totalCount,
                successCount,
                failList,
                failCount,
                ttlSeconds
        );
    }
}
