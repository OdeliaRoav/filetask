create database filetask;

create table t_user
(
    id          varchar(16) primary key,
    pwd         varchar(32)  not null,
    name        varchar(128) not null,
    level       char(1)      not null,
    description varchar(256),
    reg_date    timestamp    not null
);


create table Info(
    id          varchar(16) primary key,
    pwd         varchar(32) not null,
    name        varchar(32) not null
);