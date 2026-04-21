package com.example.filetask.repository;

import com.example.filetask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.io.*;
import java.util.*;

public interface UserRepository extends JpaRepository<User, String> {
    //JpaRepository 안에 save, findAll 구현
}
