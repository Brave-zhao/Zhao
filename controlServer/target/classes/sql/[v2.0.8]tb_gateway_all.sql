/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50725
Source Host           : localhost:3306
Source Database       : controlserver

Target Server Type    : MYSQL
Target Server Version : 50725
File Encoding         : 65001

Date: 2021-11-30 11:55:38
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `tb_gateway_history`
-- ----------------------------
DROP TABLE IF EXISTS `tb_gateway_history`;
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
) ENGINE=InnoDB AUTO_INCREMENT=370 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_gateway_history
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_gateway_mode`
-- ----------------------------
DROP TABLE IF EXISTS `tb_gateway_mode`;
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
) ENGINE=InnoDB AUTO_INCREMENT=762 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_gateway_mode
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_gateway_name`
-- ----------------------------
DROP TABLE IF EXISTS `tb_gateway_name`;
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

-- ----------------------------
-- Records of tb_gateway_name
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_gateway_record`
-- ----------------------------
DROP TABLE IF EXISTS `tb_gateway_record`;
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
) ENGINE=InnoDB AUTO_INCREMENT=32994 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_gateway_record
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_gateway_timing`
-- ----------------------------
DROP TABLE IF EXISTS `tb_gateway_timing`;
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_gateway_timing
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_gateway_warning`
-- ----------------------------
DROP TABLE IF EXISTS `tb_gateway_warning`;
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
) ENGINE=InnoDB AUTO_INCREMENT=260 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_gateway_warning
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_gateway_wx`
-- ----------------------------
DROP TABLE IF EXISTS `tb_gateway_wx`;
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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_gateway_wx
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_infrared_record`
-- ----------------------------
DROP TABLE IF EXISTS `tb_infrared_record`;
CREATE TABLE `tb_infrared_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `place_id` int(11) DEFAULT NULL,
  `uuid` varchar(255) DEFAULT NULL COMMENT '触发的设备唯一码',
  `status` int(11) DEFAULT NULL COMMENT '状态（0、无人  1、有人）',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL COMMENT '预留',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21818 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_infrared_record
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_mode_action`
-- ----------------------------
DROP TABLE IF EXISTS `tb_mode_action`;
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_mode_action
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_place_action`
-- ----------------------------
DROP TABLE IF EXISTS `tb_place_action`;
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_place_action
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_place_mode`
-- ----------------------------
DROP TABLE IF EXISTS `tb_place_mode`;
CREATE TABLE `tb_place_mode` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `place_id` int(11) DEFAULT NULL,
  `mode_id` int(11) DEFAULT NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_place_mode
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_sensor_record`
-- ----------------------------
DROP TABLE IF EXISTS `tb_sensor_record`;
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
) ENGINE=InnoDB AUTO_INCREMENT=9792 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_sensor_record
-- ----------------------------
