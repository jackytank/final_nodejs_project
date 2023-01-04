-- drop database if exists final_db;-- 
create database if not exists final_db;
use final_db;

CREATE TABLE if not exists `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(50) NOT NULL,
  `division_id` bigint NOT NULL,
  `entered_date` date NOT NULL,
  `position_id` tinyint NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date NOT NULL,
  `deleted_date` date NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE if not exists `division` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `note` text NULL,
  `division_leader_id` bigint NOT NULL,
  `division_floor_num` int NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date NOT NULL,
  `deleted_date` date NULL,
  PRIMARY KEY (`id`)
);

alter table `division`
add constraint `FK_division_user` foreign key(division_leader_id) references user(id);