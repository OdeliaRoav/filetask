package com.example.filetask.service;

import com.example.filetask.dto.UploadResponse;

import java.util.ArrayList;
import java.util.List;

public class UploadResult {
    private int successCount;
    private int failCount;
    private List<String> failList = new ArrayList<>();

    public void addSuccess(){
        successCount++;
    }

    public void addFail(int lineNum, String line, Exception e){
        failList.add(lineNum + "번 줄 실패 : " + line + "\n" + e.getMessage());
        failCount++;
    }

    public boolean isSuccess(){
        return successCount > 0;
    }

    public UploadResponse toResponse(
            boolean duplicated,
            boolean forced,
            String fileName,
            int totalCount,
            long ttlSeconds
    ){
        return UploadResponse.complete(
                duplicated,
                forced,
                fileName,
                totalCount,
                successCount,
                failList,
                failCount,
                ttlSeconds
        );
    }

}
