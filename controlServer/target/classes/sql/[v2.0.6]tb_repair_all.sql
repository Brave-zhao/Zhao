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
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8 COMMENT='资产报修表';
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
  `deleted` bigint(20) DEFAULT '0' COMMENT '0未删除',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8 COMMENT='报修分配表';
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
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='报修修改记录表';
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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-10-25 18:13:23
