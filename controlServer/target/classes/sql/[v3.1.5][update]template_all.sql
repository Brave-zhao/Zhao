/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50725
Source Host           : localhost:3306
Source Database       : controlserver

Target Server Type    : MYSQL
Target Server Version : 50725
File Encoding         : 65001

Date: 2022-12-07 16:56:15
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `tb_background`
-- ----------------------------
DROP TABLE IF EXISTS `tb_background`;
CREATE TABLE `tb_background` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `original_name` varchar(255) DEFAULT NULL COMMENT '文件原始名称',
  `url` varchar(255) DEFAULT NULL COMMENT '访问链接',
  `real_path` varchar(255) DEFAULT NULL COMMENT '真实文件路径',
  `type` int(11) DEFAULT '1' COMMENT '类型（1、系统默认  2、自定义）',
  `user_id` int(11) DEFAULT NULL COMMENT '上传用户id',
  `application` int(11) DEFAULT '1' COMMENT '用途(1、紧急模式  2、欢迎模式  3、自定义模式)',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_background
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_control_component`
-- ----------------------------
DROP TABLE IF EXISTS `tb_control_component`;
CREATE TABLE `tb_control_component` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `component_id` varchar(255) NOT NULL COMMENT '组件id',
  `type` varchar(255) DEFAULT 'button' COMMENT '组件类型（button：按钮）',
  `style` text COMMENT '样式json',
  `place_id` int(11) DEFAULT NULL COMMENT '地点id',
  `template_id` int(11) DEFAULT NULL COMMENT '模板id',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  `deleted` int(11) DEFAULT '0' COMMENT '删除标识（0：未删除   非0：已删除）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=516 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tb_control_component
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_control_template`
-- ----------------------------
DROP TABLE IF EXISTS `tb_control_template`;
CREATE TABLE `tb_control_template` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `name` varchar(255) DEFAULT NULL COMMENT '名称',
  `content` text,
  `user_id` int(11) DEFAULT NULL COMMENT '创建者id',
  `enable` int(11) DEFAULT '1' COMMENT '是否启用（0、不启用  1、启用）',
  `cover` varchar(255) DEFAULT NULL COMMENT '封面相对路径',
  `cover_path` varchar(255) DEFAULT NULL COMMENT '封面的文件路径',
  `system` int(11) DEFAULT '0' COMMENT '是否系统模板（0：否  1：是）',
  `system_flag` varchar(255) DEFAULT NULL COMMENT '系统模板标识，用于标识系统模板，避免重复生成',
  `priority` int(11) DEFAULT '99' COMMENT '系统模板优先级，越小优先级越高',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  `deleted` int(11) DEFAULT '0' COMMENT '删除标识（0：未删除   非0：已删除）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tb_control_template
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_inspection_detail`
-- ----------------------------
DROP TABLE IF EXISTS `tb_inspection_detail`;
CREATE TABLE `tb_inspection_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `inspection_id` int(11) NOT NULL COMMENT '巡检id',
  `property_id` int(11) DEFAULT NULL COMMENT '设备id',
  `property_name` varchar(255) DEFAULT NULL COMMENT '设备名称',
  `place_id` int(255) DEFAULT NULL COMMENT '设备所在的地点Id',
  `place_name` varchar(255) DEFAULT NULL COMMENT '设备所在的地点名称',
  `content` text COMMENT '内容',
  `time` datetime DEFAULT NULL COMMENT '异常发生的时间',
  `step` varchar(255) DEFAULT NULL COMMENT '巡检步骤（online: 离线检测; warning: 预警检测;fault:故障检测 ）',
  `start_time` datetime DEFAULT NULL COMMENT '开始检测时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束检测时间',
  `duration` bigint(20) DEFAULT NULL COMMENT '检测花费的时间（单位毫秒）',
  `status` int(11) DEFAULT NULL COMMENT '状态（1：正常  2：异常  3：已忽略）',
  `record_id` int(11) DEFAULT NULL COMMENT '对应的数据id，可能为空',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_inspection_id` (`inspection_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2441 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tb_inspection_detail
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_inspection_record`
-- ----------------------------
DROP TABLE IF EXISTS `tb_inspection_record`;
CREATE TABLE `tb_inspection_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL COMMENT '巡检名称（保留）',
  `user_id` int(11) DEFAULT NULL COMMENT '用户id',
  `place_id` int(11) DEFAULT NULL COMMENT '巡检的地点，为null则表示全部地点',
  `property_flags` varchar(255) DEFAULT NULL COMMENT '巡检的资产类型，为null则表示全部类型',
  `place_ids` varchar(1000) DEFAULT NULL COMMENT '巡检的地点ids',
  `property_types` varchar(1000) DEFAULT NULL COMMENT '资产类型ids',
  `progress` double DEFAULT '0' COMMENT '进度（范围0-100）',
  `step` varchar(255) DEFAULT NULL COMMENT '进度说明（online: 离线检测; warning: 预警检测;fault:故障检测 ）',
  `total` int(11) DEFAULT '0' COMMENT '巡检总数',
  `patrolled` int(11) DEFAULT '0' COMMENT '已巡检的数量',
  `status_equipment_total` int(11) DEFAULT '0' COMMENT '状态巡检设备总数量',
  `status_equipment_online` int(11) DEFAULT '0' COMMENT '状态巡检在线设备数',
  `status_equipment_offline` int(11) DEFAULT '0' COMMENT '状态巡检设备离线数',
  `warning_equipment_total` int(11) DEFAULT '0' COMMENT '预警巡检设备总数',
  `warning_equipment_abnormal` int(11) DEFAULT '0' COMMENT '预警巡检设备异常数',
  `fault_equipment_total` int(11) DEFAULT '0' COMMENT '故障巡检设备总数',
  `fault_equipment_abnormal` int(11) DEFAULT '0' COMMENT '故障巡检设备异常数',
  `status` int(11) DEFAULT NULL COMMENT '状态（1:已完成  2:正在巡检  3:已取消  4:异常中止）',
  `error_reason` varchar(255) DEFAULT NULL COMMENT '异常中止原因',
  `start_time` datetime DEFAULT NULL COMMENT '开始巡检的时间',
  `end_time` datetime DEFAULT NULL COMMENT '巡检结束时间',
  `duration` bigint(20) DEFAULT NULL COMMENT '持续时间(单位毫秒)',
  `method` int(11) DEFAULT '1' COMMENT '发起方式(1、用户手动巡检  2、定时巡检)',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=243 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tb_inspection_record
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_inspection_timing`
-- ----------------------------
DROP TABLE IF EXISTS `tb_inspection_timing`;
CREATE TABLE `tb_inspection_timing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL COMMENT '定时名称',
  `user_id` int(11) DEFAULT NULL COMMENT '用户id',
  `weeks` varchar(255) DEFAULT NULL COMMENT '周几，1-7表示周一到周日',
  `everyday` int(11) DEFAULT NULL COMMENT '每天执行（0、否  1、是）',
  `date` varchar(255) DEFAULT NULL COMMENT '其他日期，格式yyyy-MM-dd',
  `time` varchar(255) DEFAULT NULL COMMENT '执行时间，格式HH:mm:ss',
  `cron` varchar(255) DEFAULT NULL COMMENT 'cron表达式',
  `all` int(11) DEFAULT '1' COMMENT '是否巡检全部（1：是  0：否）',
  `place_ids` varchar(1000) DEFAULT NULL COMMENT '地点ids',
  `property_types` varchar(1000) DEFAULT NULL,
  `status` int(11) DEFAULT NULL COMMENT '状态（1、启用  0、未启用）',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tb_inspection_timing
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_multi_control`
-- ----------------------------
DROP TABLE IF EXISTS `tb_multi_control`;
CREATE TABLE `tb_multi_control` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL COMMENT '名称',
  `order` int(11) DEFAULT NULL COMMENT '序号',
  `user_id` int(11) DEFAULT NULL,
  `instruct` varchar(255) DEFAULT NULL COMMENT '指令内容',
  `style` text COMMENT '样式json字符串',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL COMMENT '租户id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tb_multi_control
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_place_template`
-- ----------------------------
DROP TABLE IF EXISTS `tb_place_template`;
CREATE TABLE `tb_place_template` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `place_id` int(11) NOT NULL COMMENT '地点id',
  `template_id` int(11) NOT NULL COMMENT '模板id',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL COMMENT '租户id',
  PRIMARY KEY (`id`),
  KEY `idx_place_id` (`place_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tb_place_template
-- ----------------------------

-- ----------------------------
-- Table structure for `tb_unattended_config`
-- ----------------------------
DROP TABLE IF EXISTS `tb_unattended_config`;
CREATE TABLE `tb_unattended_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unattended` int(11) DEFAULT '0' COMMENT '是否无人值守（0、否  1、是）',
  `password` varchar(255) DEFAULT NULL COMMENT '无人值守密码',
  `transfer` int(11) DEFAULT NULL COMMENT '是否转接中（0 、否  1、是）',
  `number` varchar(255) DEFAULT NULL COMMENT '转接号码（预留）',
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_id` (`user_id`,`tenant_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tb_unattended_config
-- ----------------------------
