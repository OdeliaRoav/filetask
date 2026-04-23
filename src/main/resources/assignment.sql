create database filetask;

create table t_users{
    id varchar(16) primary key,
    pwd varchar(32) primary key,
    name varchar(128) not null,
    level char(1) not null,
    description varchar(256) not null,
    reg_date timestamp not null
    }

