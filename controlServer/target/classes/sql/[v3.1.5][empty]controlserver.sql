-- MySQL dump 10.13  Distrib 5.7.25, for Win64 (x86_64)
--
-- Host: localhost    Database: controlserver
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
  `user_type` tinyint(4) DEFAULT '0' COMMENT '用户类型[0:访客;1:系统用户;2:临时参会人]\n',
  `nickname` varchar(255) DEFAULT NULL COMMENT '昵称[冗余字段]',
  `dep_id` varchar(255) DEFAULT NULL COMMENT '用户所属部门id',
  `dep_name` varchar(255) DEFAULT NULL COMMENT '用户所属部门名称',
  `way` tinyint(4) DEFAULT NULL COMMENT '开门方式[1:IC卡; 2:APP; 3:二维码; 4:远程开门; 5:密码; 6:人脸识别; 7:扫码开门]',
  `place_id` int(11) DEFAULT NULL COMMENT '地点id[冗余字段]',
  `property_id` int(11) DEFAULT NULL COMMENT '资产id[冗余字段]',
  `deleted` tinyint(4) DEFAULT '0',
  `tenant_id` varchar(255) DEFAULT NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  `open_type` tinyint(4) DEFAULT '1' COMMENT '0：离线；1：在线；',
  PRIMARY KEY (`id`),
  KEY `index_unique_code_time` (`unique_code`,`time`) USING BTREE COMMENT '设备唯一码和开门时间的符合索引'
) ENGINE=InnoDB AUTO_INCREMENT=771 DEFAULT CHARSET=utf8 COMMENT='门禁开门日志表(用于记录开门次数)';
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
-- Table structure for table `tb_gateway_history`
--

DROP TABLE IF EXISTS `tb_gateway_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_gateway_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL COMMENT '网关设备uuid',
  `device_id` varchar(255) NOT NULL COMMENT '网关子设备id',
  `date` varchar(255) DEFAULT NULL COMMENT '统计的日期或月份，格式统一为yyyy-MM-dd',
  `battery` bigint(20) DEFAULT NULL COMMENT '总用电量',
  `power` bigint(20) DEFAULT NULL COMMENT '有功功率',
  `history_type` varchar(255) DEFAULT NULL COMMENT '历史记录类型，daily：日统计  month：月统计',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_device_id` (`device_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_gateway_mode`
--

DROP TABLE IF EXISTS `tb_gateway_mode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_gateway_mode` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL COMMENT '模式名称',
  `command` varchar(255) DEFAULT NULL,
  `order` int(11) NOT NULL COMMENT '排序',
  `hex` varchar(255) DEFAULT NULL COMMENT '十六进制',
  `hex_success` varchar(255) DEFAULT NULL COMMENT '十六进制成功指令',
  `hex_fail` varchar(255) DEFAULT NULL COMMENT '十六进制失败指令',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=817 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_gateway_name`
--

DROP TABLE IF EXISTS `tb_gateway_name`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_gateway_name` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL COMMENT '网关设备uuid或子设备uuid',
  `name` varchar(255) DEFAULT NULL COMMENT '设备名称',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_uuid` (`uuid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_gateway_record`
--

DROP TABLE IF EXISTS `tb_gateway_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_gateway_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL COMMENT '网关设备唯一码',
  `device_id` varchar(255) NOT NULL COMMENT '设备id',
  `temperature` int(11) DEFAULT NULL COMMENT '温度，单位℃',
  `current` bigint(20) DEFAULT NULL COMMENT '电流，单位毫安',
  `closed_status` int(11) DEFAULT NULL COMMENT '合闸状态',
  `relay_status` int(11) DEFAULT NULL COMMENT '继电器状态',
  `short_circuits` int(11) DEFAULT NULL COMMENT '短路次数',
  `max_current` bigint(20) DEFAULT NULL COMMENT '最大电流，单位毫安',
  `voltage` bigint(20) DEFAULT NULL COMMENT '电压，单位毫伏',
  `power` bigint(20) DEFAULT NULL COMMENT '功率，单位瓦',
  `total_battery` bigint(20) DEFAULT NULL COMMENT '历史用电量，单位Wh',
  `current_battery` bigint(20) DEFAULT NULL COMMENT '本轮电量，单位Wh',
  `battery` bigint(20) DEFAULT NULL COMMENT '上次上传数据的时间到现在的用电量',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_device_id` (`device_id`)
) ENGINE=InnoDB AUTO_INCREMENT=175 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_gateway_timing`
--

DROP TABLE IF EXISTS `tb_gateway_timing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_gateway_timing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL COMMENT '定时名称',
  `uuid` varchar(255) NOT NULL COMMENT '网关设备uuid，多个设备之间用英文逗号分隔',
  `device_ids` varchar(255) NOT NULL COMMENT '子设备id',
  `weeks` varchar(255) DEFAULT NULL COMMENT '周几，1-7表示周一到周日',
  `everyday` int(11) DEFAULT NULL COMMENT '每天执行（0、否  1、是）',
  `date` varchar(255) DEFAULT NULL COMMENT '其他日期，格式yyyy-MM-dd',
  `time` varchar(255) DEFAULT NULL COMMENT '执行时间，格式HH:mm:ss',
  `op_code` int(11) DEFAULT NULL COMMENT '操作码，0：关  1：开',
  `cron` varchar(255) DEFAULT NULL COMMENT 'cron表达式',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_gateway_warning`
--

DROP TABLE IF EXISTS `tb_gateway_warning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_gateway_warning` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL COMMENT '网关设备唯一码',
  `device_id` varchar(255) NOT NULL COMMENT '设备id',
  `warn_type` varchar(255) DEFAULT NULL COMMENT '警告类型，多个之间用英文逗号分隔',
  `revoke` int(11) DEFAULT '0' COMMENT '是否已撤销（1、是  0、否）',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_device_id` (`device_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_gateway_wx`
--

DROP TABLE IF EXISTS `tb_gateway_wx`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_gateway_wx` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `wx_id` varchar(255) NOT NULL COMMENT '微信用户id',
  `uuid` varchar(255) NOT NULL COMMENT '空开网关唯一码',
  `name` varchar(255) DEFAULT NULL COMMENT '设备名称，预留字段',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL COMMENT '租户id，预留',
  PRIMARY KEY (`id`),
  KEY `idxwx_id` (`wx_id`),
  KEY `idxuuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_infrared_record`
--

DROP TABLE IF EXISTS `tb_infrared_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_infrared_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `place_id` int(11) DEFAULT NULL,
  `uuid` varchar(255) DEFAULT NULL COMMENT '触发的设备唯一码',
  `status` int(11) DEFAULT NULL COMMENT '状态（0、无人  1、有人）',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL COMMENT '预留',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_mode_action`
--

DROP TABLE IF EXISTS `tb_mode_action`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_mode_action` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(1000) DEFAULT NULL COMMENT '描述',
  `uuid` varchar(255) NOT NULL COMMENT '网关唯一码',
  `mode_id` int(11) NOT NULL COMMENT '模式id',
  `open_devices` varchar(1000) DEFAULT NULL COMMENT '开启的子设备id，多个之间用英文逗号分隔',
  `close_devices` varchar(1000) DEFAULT NULL COMMENT '关闭的子设备id列表，多个之间用英文逗号分隔',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_place_action`
--

DROP TABLE IF EXISTS `tb_place_action`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_place_action` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `place_id` int(11) NOT NULL,
  `action` varchar(255) DEFAULT NULL,
  `action_type` varchar(255) DEFAULT NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_placeid` (`place_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_place_mode`
--

DROP TABLE IF EXISTS `tb_place_mode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_place_mode` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `place_id` int(11) DEFAULT NULL,
  `mode_id` int(11) DEFAULT NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_repair`
--

DROP TABLE IF EXISTS `tb_repair`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_repair` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` int(11) DEFAULT NULL COMMENT '资产id',
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
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '状态[1:已上报;2:已分配;3:处理中;4:已完成;8:已撤销]',
  `sub_status` tinyint(4) DEFAULT '1' COMMENT '子状态[1:已上报;2:处理中;4:已完成]',
  `book_time` timestamp NULL DEFAULT NULL COMMENT '上门时间',
  `complete_time` timestamp NULL DEFAULT NULL COMMENT '完成时间',
  `spend` int(11) DEFAULT '0' COMMENT '用时时长',
  `type` int(11) DEFAULT '1' COMMENT '报修类型对应的主键id',
  `type_name` varchar(255) DEFAULT NULL COMMENT '报修类型名称',
  `type_flag` varchar(255) DEFAULT NULL COMMENT '报修类型标识[REPAIR表示设备报修]',
  `level` int(11) DEFAULT '1' COMMENT '报修等级[1:轻微;2:严重;3:紧急]',
  `check_in_time` timestamp NULL DEFAULT NULL COMMENT '签到时间（处理中的时间）',
  `assign_time` timestamp NULL DEFAULT NULL COMMENT '分配时间',
  `assign_type` int(11) DEFAULT NULL COMMENT '派单方式[1:手动派单; 2:自动派单]',
  `place_id` int(11) DEFAULT NULL COMMENT '地点id',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  `tenant_id` varchar(255) DEFAULT NULL COMMENT '租户id',
  `deleted` tinyint(4) DEFAULT '0' COMMENT '是否被删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_number` (`number`)
) ENGINE=InnoDB AUTO_INCREMENT=268 DEFAULT CHARSET=utf8 COMMENT='资产报修表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_repair_assign`
--

DROP TABLE IF EXISTS `tb_repair_assign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_repair_assign` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键自增id',
  `repair_id` bigint(20) NOT NULL COMMENT '报修id',
  `user_id` bigint(20) DEFAULT NULL COMMENT '分配的用户id（与dep_id互斥）',
  `dep_id` bigint(20) DEFAULT NULL COMMENT '分配的部门id（与user_id互斥）',
  `is_sub` tinyint(4) DEFAULT '0' COMMENT '是否是子分配[0:否; 1:是]',
  `deleted` bigint(20) DEFAULT '0' COMMENT '0未删除',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8 COMMENT='报修分配表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_repair_evaluation`
--

DROP TABLE IF EXISTS `tb_repair_evaluation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_repair_evaluation` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `repair_id` bigint(20) NOT NULL COMMENT '报修id',
  `score` int(11) DEFAULT '0' COMMENT '分数[0~5]',
  `content` text COMMENT '评价内容',
  `user_id` bigint(20) DEFAULT NULL COMMENT '评价人的用户id',
  `deleted` bigint(20) DEFAULT '0' COMMENT '0未删除',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL COMMENT '租户id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_repair_id` (`repair_id`,`deleted`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8 COMMENT='报修评价表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_repair_result`
--

DROP TABLE IF EXISTS `tb_repair_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_repair_result` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键自增id',
  `repair_id` bigint(20) NOT NULL COMMENT '报修id',
  `description` text COMMENT '描述',
  `files` text COMMENT '文件相对路径，多个以逗号分隔',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '状态[1:成功;2:失败]',
  `user_id` bigint(20) DEFAULT NULL COMMENT '用户id',
  `deleted` bigint(20) DEFAULT '0' COMMENT '0未删除',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8 COMMENT='报修结果表';
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
) ENGINE=InnoDB AUTO_INCREMENT=288 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='报修修改记录表';
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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_sensor_record`
--

DROP TABLE IF EXISTS `tb_sensor_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_sensor_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL COMMENT '设备唯一码',
  `temperature` double DEFAULT NULL COMMENT '温度值',
  `humidity` double DEFAULT NULL COMMENT '湿度值',
  `pm25` double DEFAULT NULL COMMENT 'pm2.5值',
  `co2` double DEFAULT NULL COMMENT 'co2值',
  `hcho` double DEFAULT NULL COMMENT '甲醛值',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_uuid` (`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8;
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
  `status` tinyint(4) NOT NULL COMMENT '状态(1:等待响应; 2:没有重发策略的等待响应; 4:成功; 8:失败; 16:强制取消; 32:部分成功，部分失败)',
  `type` tinyint(4) NOT NULL COMMENT '类型(1:白名单操作; 2:远程开门)',
  `retry` int(11) NOT NULL COMMENT '重试次数（如果此值设置为-1，表示不需要重发）',
  `content` text COMMENT '操作内容（JSON字符串）',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33317 DEFAULT CHARSET=utf8 COMMENT='SK87操作表';
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
) ENGINE=InnoDB AUTO_INCREMENT=203 DEFAULT CHARSET=utf8 COMMENT='门禁白名单表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'controlserver'
--

--
-- Dumping routines for database 'controlserver'
--
/*!50003 DROP FUNCTION IF EXISTS `getPlaceDetailName` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `getPlaceDetailName`(rootId INT) RETURNS varchar(1000) CHARSET utf8
BEGIN
			DECLARE result VARCHAR(1000); 
			DECLARE temp VARCHAR(1000); 
			DECLARE temp_name VARCHAR(1000);
			DECLARE isReturn INT(1);
			DECLARE lastTemp INT(1);

			SET result = ''; 
			SET temp =cast(rootId as CHAR); 
			SET isReturn = 1;
			SET temp_name = '';
			SET lastTemp = 0;

			WHILE temp is not null AND lastTemp != temp AND isReturn != 0 DO 
					SET lastTemp = temp;
					SET result = concat(`temp_name`,result); 
					SELECT `name`,pid INTO temp_name,temp FROM tb_place where id = temp; 
					SET isReturn = temp;
			END WHILE; 
			SET result = concat(`temp_name`,result);
			RETURN result; 
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `getPlaceDetailNameForCount` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `getPlaceDetailNameForCount`(rootId INT, count INT) RETURNS varchar(1000) CHARSET utf8
BEGIN
			DECLARE result VARCHAR(1000); 
			DECLARE temp VARCHAR(1000); 
			DECLARE temp_name VARCHAR(1000);
			DECLARE isReturn INT(1);
			DECLARE _count INT(1);

			SET result = ''; 
			SET temp =cast(rootId as CHAR); 
			SET isReturn = 1;
			SET temp_name = '';
			SET _count = 0;

			WHILE temp is not null AND isReturn != 0 AND _count < count AND count > 0 DO 
					SET result = concat(`temp_name`,result); 
					SELECT `name`,pid INTO temp_name,temp FROM tb_place where id = temp; 
					SET isReturn = temp;
					SET _count = _count + 1;
			END WHILE; 
			SET result = concat(`temp_name`,result);
			RETURN result; 
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `is_mixed` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `is_mixed`(str1 TEXT, str2 TEXT) RETURNS tinyint(4)
BEGIN
    DECLARE ismixed TINYINT DEFAULT 0;
    set ismixed:=(select concat(',', concat(str1, ',')) regexp concat(',', concat(replace(str2,',',',|,'), ',')));
    RETURN ismixed;
    END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-11-29 16:00:40
