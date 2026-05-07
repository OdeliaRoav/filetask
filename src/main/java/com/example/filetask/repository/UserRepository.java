package com.example.filetask.repository;

import com.example.filetask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.io.*;
import java.util.*;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

}
