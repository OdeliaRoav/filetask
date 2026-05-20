package com.example.filetask.exception;

// enum이란 관련이 있는 상수들의 집합.
public enum testEnum {
    FILE_SUCCESS(200, "200_OK"),
    FILE_CONTINUE(201, "201_CONTINUE");

    private final int status;
    private final String code;

    testEnum(int status, String code){
        this.status = status;
        this.code = code;
    }

    public int getStatus(){
        return status;
    }

    public String getCode(){
        return code;
    }

}



/*
* public enum testEnum{
*   FILE_SUCCESS(200, "200_OK"),
*   FILE_CONTINUE(201, "201_OK")
*
*
*
*
*
*
* */