package com.example.filetask.exception;

public class InvalidColumnException extends RuntimeException{

    public InvalidColumnException(String message){
        super(message);
    }
}
