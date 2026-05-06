package com.example.filetask.repository;

import com.example.filetask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.io.*;
import java.util.*;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    //JpaRepository로 기본 CRUD 기능 제공
}
