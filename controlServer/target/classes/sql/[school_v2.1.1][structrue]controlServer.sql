-- MySQL dump 10.13  Distrib 5.7.25, for Win64 (x86_64)
--
-- Host: localhost    Database: controlserver_edu_v2
-- ------------------------------------------------------
-- Server version	5.7.25-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tb_access_control_open_log`
--

DROP TABLE IF EXISTS `tb_access_control_open_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_access_control_open_log` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `unique_code` varchar(255) NOT NULL COMMENT '设备唯一码',
  `type` tinyint(4) NOT NULL COMMENT '门禁类型(1:普通门禁; 2:测温门禁)',
  `time` timestamp NULL DEFAULT NULL COMMENT '开门时间',
  `status` tinyint(4) NOT NULL COMMENT '状态(1:未知; 4:成功; 8:失败)',
  `user_id` int(11) DEFAULT NULL COMMENT '开门人员的用户id',
  `user_type` tinyint(4) DEFAULT NULL COMMENT '用户类型[0:访客;1:系统用户;2:临时参会人]\\n',
  `nickname` varchar(255) DEFAULT NULL COMMENT '昵称[冗余字段]',
  `dep_id` int(11) DEFAULT NULL COMMENT '用户所属部门id',
  `dep_name` varchar(255) DEFAULT NULL COMMENT '用户所属部门名称',
  `way` tinyint(4) DEFAULT NULL COMMENT '开门方式[1:IC卡; 2:APP; 3:二维码; 4:远程开门; 5:密码; 6:人脸识别; 7:扫码开门]',
  `place_id` int(11) DEFAULT NULL COMMENT '地点id[冗余字段]',
  `property_id` int(11) DEFAULT NULL COMMENT '资产id[冗余字段]',
  `deleted` tinyint(4) DEFAULT '0',
  `tenant_id` varchar(255) DEFAULT NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  PRIMARY KEY (`id`),
  KEY `index_unique_code_time` (`unique_code`,`time`) USING BTREE COMMENT '设备唯一码和开门时间的符合索引'
) ENGINE=InnoDB AUTO_INCREMENT=314 DEFAULT CHARSET=utf8 COMMENT='门禁开门日志表(用于记录开门次数)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_electricity`
--

DROP TABLE IF EXISTS `tb_electricity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_electricity` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `device_id` varchar(255) NOT NULL COMMENT '设备ID',
  `start_time` bigint(20) unsigned NOT NULL COMMENT '开始时间（毫秒值）',
  `end_time` bigint(20) unsigned NOT NULL COMMENT '结束时间（毫秒值）',
  `energy` float unsigned NOT NULL COMMENT '用电量',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `deviceId_time` (`device_id`,`start_time`,`end_time`) COMMENT '联合约束，同一敏测设备，同一时间段只能有一条数据。'
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=latin1 COMMENT='电量统计表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_repair`
--

DROP TABLE IF EXISTS `tb_repair`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_repair` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL COMMENT '资产id',
  `number` varchar(255) DEFAULT NULL COMMENT '编号',
  `user_id` int(11) DEFAULT NULL COMMENT '用户id，仅当系统用户报修的时候有值',
  `nickname` varchar(255) DEFAULT NULL COMMENT '报修人名字[系统用户:昵称;非系统用户:用户填写的名字]',
  `phone` varchar(255) DEFAULT NULL COMMENT '手机号码',
  `description` text COMMENT '描述',
  `files` text COMMENT '文件相对路径，多个以逗号分隔',
  `place_name` varchar(255) DEFAULT NULL COMMENT '地点[冗余]',
  `name` varchar(255) DEFAULT NULL COMMENT '资产名称[冗余]',
  `brand` varchar(255) DEFAULT NULL COMMENT '品牌[冗余]',
  `property_type` int(11) DEFAULT NULL COMMENT '资产类型',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '状态[1:已上报;2:处理中;4:已完成]',
  `book_time` timestamp NULL DEFAULT NULL COMMENT '上门时间',
  `complete_time` timestamp NULL DEFAULT NULL COMMENT '完成时间',
  `spend` int(11) DEFAULT '0' COMMENT '用时时长',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  `tenant_id` varchar(255) DEFAULT NULL COMMENT '租户id',
  `deleted` tinyint(4) DEFAULT '0' COMMENT '是否被删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_number` (`number`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8 COMMENT='资产报修表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_repair_update_log`
--

DROP TABLE IF EXISTS `tb_repair_update_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_repair_update_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `repair_id` int(11) NOT NULL COMMENT '报修id',
  `user_id` int(11) DEFAULT NULL COMMENT '修改者的用户id',
  `init` tinyint(4) NOT NULL COMMENT '是否为初次报修提交的记录[1:是;0:否]',
  `description` text COLLATE utf8_bin COMMENT '描述',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  `tenant_id` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT '租户id',
  `deleted` tinyint(4) DEFAULT '0' COMMENT '是否被删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='报修修改记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_screen`
--

DROP TABLE IF EXISTS `tb_screen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_screen` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT '名称',
  `num` int(11) NOT NULL DEFAULT '0' COMMENT '该名称的数量',
  `flag` varchar(255) DEFAULT NULL COMMENT '标识(PROPERTY_NAME:资产名称,PROPERTY_BRAND:资产品牌,PROPERTY_MODEL:资产型号）',
  `deleted` int(11) DEFAULT NULL COMMENT '0未删除，1已删除',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_flag_name` (`name`,`flag`,`deleted`,`tenant_id`) USING BTREE,
  KEY `index_flag` (`flag`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_sk87_action`
--

DROP TABLE IF EXISTS `tb_sk87_action`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_sk87_action` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `device_sn` varchar(255) NOT NULL COMMENT 'sk87的设备sn号',
  `cmd_reply_id` int(11) DEFAULT NULL COMMENT '操作命令id',
  `status` tinyint(4) NOT NULL COMMENT '状态(1:等待响应; 2:没有重发策略的等待响应; 4:成功; 8:失败; 16:强制取消)',
  `type` tinyint(4) NOT NULL COMMENT '类型(1:白名单操作; 2:远程开门)',
  `retry` int(11) NOT NULL COMMENT '重试次数（如果此值设置为-1，表示不需要重发）',
  `content` text COMMENT '操作内容（JSON字符串）',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2353 DEFAULT CHARSET=utf8 COMMENT='SK87操作表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_sk87_white_list`
--

DROP TABLE IF EXISTS `tb_sk87_white_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_sk87_white_list` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `value` varchar(255) NOT NULL COMMENT '用户id',
  `type` int(11) DEFAULT NULL COMMENT 'ID类型（1：IC卡；2：APP ID; 3：二维码）',
  `status` tinyint(4) NOT NULL COMMENT '状态(1:等待响应; 2:成功; 4:失败;  8:等待删除: 16:删除失败)',
  `device_sn` varchar(255) NOT NULL COMMENT 'sk87的设备sn号',
  `start` timestamp NULL DEFAULT NULL COMMENT '有效期开始时间',
  `end` timestamp NULL DEFAULT NULL COMMENT '有效期结束时间',
  `action_id` int(11) DEFAULT NULL COMMENT '操作id',
  `start_time` varchar(255) DEFAULT NULL COMMENT '开始时间',
  `end_time` varchar(255) DEFAULT NULL COMMENT '结束时间',
  `repeat_type` tinyint(4) DEFAULT NULL COMMENT '重复类型[0:日重复; 1:周重复]',
  `repeat` varchar(255) DEFAULT NULL COMMENT '重复周',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
  `tenant_id` varchar(255) DEFAULT NULL COMMENT '租户id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `only_limit_unique` (`value`,`device_sn`) COMMENT '''[唯一约束]\\n同一门禁只能有同一类型的相同value的白名单'''
) ENGINE=InnoDB AUTO_INCREMENT=160 DEFAULT CHARSET=utf8 COMMENT='门禁白名单表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_sk87_white_list_device`
--

DROP TABLE IF EXISTS `tb_sk87_white_list_device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_sk87_white_list_device` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `white_list_id` int(11) NOT NULL COMMENT '白名单id',
  `device_sn` varchar(255) NOT NULL COMMENT 'sk87的设备sn号',
  `action_id` int(11) NOT NULL COMMENT '操作id',
  `status` tinyint(4) NOT NULL COMMENT '状态(1:等待响应; 2:成功; 4:失败; 8:超时)',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COMMENT='门禁白名单-门禁表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'controlserver_edu_v2'
--

--
-- Dumping routines for database 'controlserver_edu_v2'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-10-26 11:31:57
