-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: sistem_inventaris
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventories`
--

DROP TABLE IF EXISTS `inventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nomor_inventaris` varchar(255) NOT NULL,
  `master_sarana_inventaris_id` bigint(20) unsigned NOT NULL,
  `location_id` bigint(20) unsigned NOT NULL,
  `responsible_id` bigint(20) unsigned NOT NULL,
  `user` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `tanggal_perolehan` date DEFAULT NULL,
  `spesifikasi` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventories_nomor_inventaris_unique` (`nomor_inventaris`),
  KEY `inventories_master_sarana_inventaris_id_foreign` (`master_sarana_inventaris_id`),
  KEY `inventories_location_id_foreign` (`location_id`),
  KEY `inventories_responsible_id_foreign` (`responsible_id`),
  CONSTRAINT `inventories_location_id_foreign` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `inventories_master_sarana_inventaris_id_foreign` FOREIGN KEY (`master_sarana_inventaris_id`) REFERENCES `master_sarana_inventaris` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `inventories_responsible_id_foreign` FOREIGN KEY (`responsible_id`) REFERENCES `responsibles` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=256 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventories`
--

LOCK TABLES `inventories` WRITE;
/*!40000 ALTER TABLE `inventories` DISABLE KEYS */;
INSERT INTO `inventories` VALUES (7,'K/MOB/FM/01',1,7,11,'FM','Pembelian awal second hand dengan kondisi baik','inventories/MNWghCpYQXIL1kGNpYWiiv9YU5D7JE9UuxrO8yWq.jpg','2022-10-11','Mobil merk Toyota Agya (R 1635 WM)','2026-07-31 01:04:16','2026-08-27 00:33:59'),(11,'LAP/HCE/001',3,23,1,'Manajer HCE','Baik','inventories/Sy3TcOWcn8tLugJJI8J802CVHP31UlmCFBo9TxnQ.jpg','2023-12-24','Core i3-1115G4  RAM 4 GB SSD 256 GB','2026-07-31 01:25:09','2026-08-13 21:09:11'),(12,'LAP/PRO/001',3,24,6,'Manajer Produksi','Baik','inventories/VUHMZpwdoEV75fGXjKoiLYCBhEAkTOOaXRxk5fF2.jpg','2025-05-08','Core i3-10110U  RAM 4 GB SSD 256 GB','2026-07-31 01:31:23','2026-08-13 21:06:55'),(13,'E/PRN/HCE/001',4,23,1,'Manajer HCE','Baik','inventories/MvwrzmArW9hNutLIKym068Bo9Et5LyYrItVVqbcd.jpg','2019-10-10','Epson L3110','2026-07-31 01:33:22','2026-08-13 20:28:49'),(14,'E/PRN/KEU/001',4,9,3,'Manajer Keuangan','Baik','inventories/N97jRefjZj70glsrArrQJf0hpStQdcCxalQGEJZh.jpg','2021-10-10','Epson L3110','2026-07-31 01:37:32','2026-08-13 20:29:23'),(17,'SCA/RIC/001',5,28,15,'Manajer RIC','Baik','inventories/QloG4RylmeqthoKdksqpSxlPwTpdxv5Kz9yovGK9.jpg','2015-01-01','Canon LED 110','2026-07-31 01:58:02','2026-08-14 01:42:17'),(18,'SCA/FM/001',5,24,11,'FM','Baik','inventories/R2wikPfWPYCaYC7FdK4ACDOMmGP7kLoIgCsJFCQK.png','2026-07-31','Epson WorkForce DS-410','2026-07-31 02:01:27','2026-08-14 01:37:36'),(21,'M/MOV/OVN/001',8,19,6,'Operator Oven','Baik','inventories/huboADHD7ZOy6CNffn0iQd5A0vfWoCBngGkTcrej.jpg','2015-01-01','Mesin Oven Tungku','2026-07-31 02:10:14','2026-08-13 21:48:31'),(22,'M/MGSK/GPOS/001',8,26,6,'Operator Gosok','Baik','inventories/TPEFP87gd1aKB0wa6MS9F5ZnMHGkMG0RqWWESvTD.jpg','2015-01-01',NULL,'2026-07-31 02:13:49','2026-08-13 21:50:36'),(23,'M/GEN/HCE/001',9,21,1,'HCE/Umum','Baik','inventories/zsBMOEaPXIyEcDDQY22L5PEBJemAbjzI2evbbKI1.jpg','2026-01-02',NULL,'2026-07-31 02:17:01','2026-08-28 00:51:26'),(24,'M/GEN/FB/001',9,25,14,'FB/Umum','Baik','inventories/ccK30pUMLmTfa3OUxBS8xpv6fYLLf6ccQjPwz5S3.jpg','2015-01-02','Kompresor Screw','2026-07-31 02:19:48','2026-08-14 01:17:32'),(25,'K/MOT/MKT/001',1,7,4,'Manajer Marketing','Baik','inventories/JCXM7Pha3flc8yybyWA4ebDRqDTtTOfCCvNvybYi.png','2019-06-02','Honda Beat Tahun 2019','2026-08-13 20:54:02','2026-08-13 20:59:36'),(26,'E/KOM/HCE/001',2,23,1,'Staf HCE 1','Baik','inventories/LDK8nLGNSeVYjBAoXyTgo89Y7ya5ZtI6DaM3j33X.jpg','2026-01-02','Core i3 RAM 2 GB, Hard Disk 320 GB','2026-08-13 21:38:29','2026-08-27 21:40:33'),(27,'E/KOM/HCE/004',2,23,1,'Kabag HCE','Baik','inventories/NRHPSQMS6Z5qlwJpPnaGqnPhyCj0iSgtM8o8eZqm.jpg','2026-01-02','Core i3 RAM 2 GB, Hard Disk 500 GB','2026-08-13 21:39:49','2026-08-27 21:55:26'),(28,'E/AC/FM/001',7,24,11,'FM','Baik',NULL,'2025-12-27','Midea 2 PK','2026-08-13 21:43:49','2026-08-25 21:21:31'),(29,'E/HP/HCE/002',6,23,1,'Manajer HCE','Baik','inventories/064rJ4FEyTvj3EFYJO9ZyOqGgGvJKmbAPWRmDU3d.jpg','2026-07-08','Redmi Note 15','2026-08-14 01:20:34','2026-08-14 01:20:34'),(30,'E/HP/SC/001',6,27,8,'Manajer SC','Baik','inventories/HOX3kkMmJkLx32x8C7CYEplMs2fXY241ObkAnLhH.png','2026-01-21','Tecno Camon 40','2026-08-14 01:30:53','2026-08-14 01:30:53'),(31,'E/AC/HCE/001',7,23,1,'Manajer HCE','Baik','inventories/U83XdvMwPV9bsSUT6asyIs41JotdwoPB41sFlUGh.jpg','2020-01-12','Midea 1,5 PK','2026-08-14 01:35:19','2026-08-14 01:35:19'),(33,'K/MOT/HCE/001',1,7,1,'HCE/Umum','Baik','inventories/vxrBLCsL7aSzBQd6TczY9r9W3Qz5CGxDewu5yvgD.jpg','2026-01-02','Motor Beat (R 4675 CV)','2026-08-27 01:16:43','2026-08-27 23:35:42'),(34,'E/AC/HCE/002',7,46,1,'HCE/ Umum','Baik','inventories/GOMWuFgRaOljZ2pYmpMWaBbdZkX6DHtfz4OciyP5.jpg','2026-01-02','Daikin 1 PK','2026-08-27 02:10:37','2026-08-27 23:48:26'),(35,'E/AC/OWN/001',7,47,1,'HCE/ Umum','Baik',NULL,'2021-08-03','Midea 1,5 PK','2026-08-27 02:11:52','2026-08-28 00:59:49'),(36,'E/AC/DIR/001',7,43,1,'HCE/ Umum','Baik','inventories/2dseV0goXA1mltmeR6McqaZvVOjwJia0QJJ0Bml8.jpg','2026-01-02','Panasonic 1/2 PK','2026-08-27 02:12:55','2026-08-28 01:00:21'),(37,'E/AC/WM/001',7,16,10,'WM','Baik',NULL,'2021-03-08','Midea 2 PK','2026-08-27 02:16:58','2026-08-27 02:16:58'),(38,'E/AC/MKT/001',7,11,4,'Manajer Marketing','Baik','inventories/uwmkvPg7w1QpaikrxfvXB49xcvecPUN3biEQZesK.jpg','2026-01-02','Panasonic 1/2 PK','2026-08-27 02:29:29','2026-08-27 20:58:26'),(39,'K/MOB/HCE/001',1,7,1,'Driver','Baik',NULL,'2026-01-02','Mobil merk Grand Max Putih (R 1709 C)','2026-08-27 18:03:09','2026-08-27 18:03:09'),(40,'K/MOB/HCE/002',1,7,1,'Driver','Baik','inventories/Y4VZaDTzB7gCB7i8jeN8IdqbHkYkYAW5GPNnNHt2.jpg','2026-01-02','Mobil merk Grand Max Silver (R 1334 GL)','2026-08-27 18:05:41','2026-08-27 23:58:55'),(41,'K/MOB/HCE/003',1,7,1,'Driver','Baik','inventories/DnFJgUVJIZxpGV2G3SUOhvpUpZahohZxwp9lL2cN.jpg','2024-02-15','Mobil Pickup Zuzuki Carry  (R 9739 CL)','2026-08-27 18:07:26','2026-08-27 23:59:54'),(42,'K/MOB/DIR/001',1,7,1,'Direktur','Baik','inventories/vMQPJnINs4Vg0JZNeqGyGxHHc1A0870SWPIgKRDL.jpg','2026-03-09','Mobil merk Honda Mobilio (R 1981 L)','2026-08-27 18:09:27','2026-08-27 23:51:09'),(43,'E/AC/KEU/001',7,9,3,'Manajer Keuangan','Baik','inventories/2XfSuIDwTNpBm3EnNcrVz7daOJmAL54p27TzpAkF.jpg','2023-01-11','Midea 2 PK','2026-08-27 18:13:47','2026-08-27 21:02:21'),(44,'K/MOB/OWN/001',1,7,1,'Owner','Baik','inventories/xEzCc1P2CZQh0Ndblf0RhJPUf33AL8hrtfl429ey.jpg','2026-03-09','Mobil merk Toyota Innova (B 1197 NRT)','2026-08-27 18:14:14','2026-08-28 01:10:38'),(45,'K/MOT/HCE/002',1,7,1,'HCE/Umum','Baik','inventories/tgLGSDRV9Pl66KXzNzuiyeU5x1WCKD4b8SEXmQZn.jpg','2021-04-23','Motor Supra (R 3066 XC)','2026-08-27 18:16:28','2026-08-27 23:49:49'),(46,'E/AC/KEU/002',7,9,3,'Manajer Keuangan','Baik','inventories/KYfWjXbFewBZVKu1ghURvKGTO3Tsl0lHzZROhX1r.jpg','2026-01-02','Panasonic 1/2 PK','2026-08-27 18:17:15','2026-08-27 21:01:50'),(47,'K/MOT/HCE/003',1,7,1,'Manajer HCE','Baik',NULL,'2025-01-18','Motor Beat (R 3416 HA)','2026-08-27 18:18:17','2026-08-27 18:18:17'),(48,'E/AC/SC/001',7,27,8,'Manajer SC','Baik',NULL,'2023-01-02','Panasonic 1,5 PK','2026-08-27 18:19:42','2026-08-27 18:19:42'),(49,'K/MOT/PP/001',1,7,16,'Manajer PP','Baik','inventories/uRLrwe468IZj6LPVaShXTa2Sa7SreMSJJqf5JHKw.jpg','2026-01-02','Motor Beat (R 2436 VX)','2026-08-27 18:20:02','2026-08-27 20:42:01'),(50,'K/MOT/PRO/001',1,7,6,'Manajer Produksi','Baik',NULL,'2026-01-02','Motor Beat (R 5210 ZV)','2026-08-27 18:21:28','2026-08-27 18:21:28'),(51,'K/MOT/IC/001',1,7,17,'Manajer IC','Baik','inventories/VjGNW9ovCFtUDNVQLQOIv9x1USIJNURkikzmjAMF.jpg','2025-11-18','Motor Beat  (R 4734 AAC)','2026-08-27 18:23:14','2026-08-27 21:05:23'),(52,'K/MOT/MK/001',1,7,7,'Staf MK','Baik','inventories/Kmv1tKGi9lPgLtZplrus6lGwyoFJZMDey7G3ma3e.jpg','2025-04-23','Motor Beat  (R 4734 AAC)','2026-08-27 18:28:00','2026-08-27 20:45:25'),(53,'K/MOT/MK/002',1,7,7,'Manajer MK','Baik',NULL,'2026-03-16','Motor Beat  (R 6168 OS)','2026-08-27 18:29:36','2026-08-27 18:29:36'),(54,'K/MOT/QC/001',1,7,18,'Operator QC','Baik','inventories/kILBEC9RHYlLRPSJrNKLRyrGcKjeAfIjMv8PlXzf.jpg','2022-11-30','Motor Verza (R 6574 MV)','2026-08-27 18:31:02','2026-08-27 20:37:47'),(55,'K/MOT/QC/002',1,7,18,'Operator QC','Baik','inventories/1UctX5JY6OvD4T1gDLBrJpsfFQqlxECszFrMPkjW.jpg','2026-01-02','Motor Supra (R 2107 NV)','2026-08-27 18:32:13','2026-08-27 20:38:10'),(56,'K/MOT/QC/003',1,7,18,'Operator QC','Baik','inventories/MgatMkrq3FiGKfC8MXhyletwvCUYVCDeGCYqlpw6.jpg','2022-11-28','Motor VERZA (R 5848 AAC)','2026-08-27 18:33:28','2026-08-27 20:38:35'),(57,'K/MOT/WM/001',1,7,10,'WM','Baik',NULL,'2026-01-02','Motor Beat (R 4110 JR)','2026-08-27 18:34:57','2026-08-27 18:34:57'),(58,'K/MOT/KEU/001',1,7,3,'Manajer Keuangan','Baik','inventories/VcmmBfis1RLMMzyQYeGeHuJvSiIDmSrguuLtuGhp.jpg','2024-01-10','Motor Beat (R 2800 FAC)','2026-08-27 18:36:26','2026-08-27 21:00:15'),(59,'K/MOT/KEU/002',1,7,3,'Spv Accounting','Baik','inventories/lhoIQy5HGME3i9min6R4fhHFAZGntSZ1judlfHAU.jpg','2024-03-23','Motor Verza CB (R 2949 XC)','2026-08-27 18:38:22','2026-08-27 20:59:45'),(60,'K/MOT/RIC/001',1,7,15,'Manajer RIC','Baik',NULL,'2024-01-10','Motor Beat (R 2799 FAC)','2026-08-27 18:39:49','2026-08-27 18:39:49'),(61,'K/MOT/SC/001',1,7,8,'Manajer SC','Baik',NULL,'2025-01-18','Motor Beat (R 3124 JAC)','2026-08-27 18:41:14','2026-08-27 18:41:14'),(62,'E/KOM/HCE/002',2,23,1,'Vacant','Baik','inventories/adwVGaHx2WAhJJ8TQK6NEZzb8ZAj5tOefx8p2gPz.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 18:44:00','2026-08-27 21:41:56'),(63,'E/KOM/HCE/003',2,23,1,'Vacant','Baik','inventories/7QtYXMNoJMs9EHQGAcOTXWwp28BJSzGMkz2hYX7c.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 500 GB','2026-08-27 18:44:51','2026-08-27 21:42:58'),(64,'LAP/HCE/002',3,23,1,'Staf GA IT','Baik',NULL,'2026-01-02','Core i3 6006U RAM 4 GB SSD 512 GB','2026-08-27 18:45:12','2026-08-27 18:45:12'),(65,'M/MOV/OVN/002',8,19,6,'Operator Oven','Baik',NULL,'2026-01-02',NULL,'2026-08-27 18:45:47','2026-08-27 18:45:47'),(66,'LAP/HCE/003',3,23,1,'HCE/Umum','Baik',NULL,'2026-01-02','Intel Celeron N2840 RAM 2 GB Hardisk 500 GB','2026-08-27 18:46:25','2026-08-27 18:46:25'),(67,'M/MOV/OVN/003',8,19,6,'Operator Oven','Baik',NULL,'2026-01-02',NULL,'2026-08-27 18:46:31','2026-08-27 18:46:31'),(68,'M/MOV/OVN/004',8,19,6,'Operator Oven','Baik',NULL,'2026-01-02',NULL,'2026-08-27 18:46:59','2026-08-27 18:46:59'),(69,'M/MOV/OVN/005',8,19,6,'Operator Oven','Baik',NULL,'2026-01-02',NULL,'2026-08-27 18:47:36','2026-08-27 18:47:36'),(70,'LAP/HCE/004',3,23,1,'HCE/umum','Baik',NULL,'2026-01-02','Intel Celeron N2840 RAM 2 GB Hardisk 500 GB','2026-08-27 18:47:38','2026-08-27 18:47:38'),(71,'LAP/HCE/005',3,23,1,'HCE/umum','Baik',NULL,'0226-01-02','Intel Celeron N2840 RAM 2 GB Hardisk 500 GB','2026-08-27 18:48:50','2026-08-27 18:48:50'),(72,'E/KOM/HCE/005',2,29,1,'Absensi','Baik','inventories/98BbZXzZ9honXu8xXzYcEeVWHlJtnjS0L24bjJ8V.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 80 GB','2026-08-27 18:50:41','2026-08-28 01:04:14'),(73,'LAP/FM/001',3,24,11,'FM','Baik','inventories/oIcEUHQ5IH8D4fKaG5Qg85PournAdFbHDnDtgnPl.jpg','2026-01-02','Core i3 6006U RAM 4 GB SSD 512 GB','2026-08-27 18:50:47','2026-08-27 21:07:56'),(74,'LAP/PP/001',3,24,16,'Manajer PP','Baik','inventories/8W7UbSBxEg7G2GhUgWe4CfJUWkft9MyEyVqmciyu.jpg','2026-01-02','Core i3-10110U  RAM 4 GB SSD 256 GB','2026-08-27 18:52:15','2026-08-27 20:41:10'),(75,'LAP/PRO/002',3,24,6,'Spv Produksi','Baik',NULL,'2026-01-02','Intel Celeron N3350  RAM 4 GB Hardisk 500 GB','2026-08-27 18:53:31','2026-08-27 18:53:31'),(76,'M/MGSK/GPOS/002',8,26,6,'Operator GPOS','Baik',NULL,'2026-01-02',NULL,'2026-08-27 18:53:49','2026-08-27 18:53:49'),(77,'M/MGSK/GPOS/003',8,26,6,'Operator GPOS','Baik',NULL,'2026-01-02',NULL,'2026-08-27 18:54:32','2026-08-27 18:54:32'),(78,'LAP/PRO/003',3,24,6,'Staf Produksi 1','Baik','inventories/3PdYQEEvl5z33aueTl22nFLRXfhK3ZplrDZzbBbO.jpg','2026-01-02','AMD E1-7010 RAM 2 GB Hardisk 500 GB','2026-08-27 18:55:07','2026-08-27 20:59:27'),(79,'LAP/PRO/004',3,24,6,'Staf Produksi 2','Baik',NULL,'2026-01-02','AMD A4-5000 RAM 2 GB Hardisk 500 GB','2026-08-27 18:56:13','2026-08-27 18:56:13'),(80,'E/KOM/HCE/006',2,30,1,'Server','Baik','inventories/jGkcdolEcBncw1BTqKHRFNPvGR9X5DvwJUhzs6nE.jpg','2026-01-02','Intel Xeon RAM 20 GB, Hard Disk 3 TERA','2026-08-27 18:56:31','2026-08-28 01:01:24'),(81,'E/KOM/OWN/001',2,47,1,'Owner','Baik',NULL,'2026-01-02','Core i5 RAM 8 GB, Hard Disk 240 GB','2026-08-27 18:57:24','2026-08-31 21:57:55'),(82,'M/MGSK/GPOS/004',8,26,6,'Operator GPOS','Baik',NULL,'2026-01-02',NULL,'2026-08-27 18:57:26','2026-08-27 18:57:26'),(83,'LAP/PRO/005',3,23,6,'Vacant','Baik',NULL,'2026-01-02','AMD A4-5000 RAM 2 GB Hardisk 500 GB','2026-08-27 18:57:46','2026-08-27 18:57:46'),(84,'M/MGSK/GPOS/005',8,26,6,'Operator GPOS','Baik',NULL,'2026-01-02',NULL,'2026-08-27 18:57:59','2026-08-27 18:57:59'),(85,'E/KOM/FM/001',2,24,11,'Admin Pusat (Vacant)','Baik','inventories/vUPnzqOsZSwvZtf4N8nCuKx5M5KoQQmip36GLi7t.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 18:58:18','2026-08-27 21:08:50'),(86,'M/MGSK/GPOS/006',8,26,6,'Operator GPOS','Baik',NULL,'2026-01-02',NULL,'2026-08-27 18:58:21','2026-08-27 18:58:21'),(87,'M/MGSK/GPOS/007',8,26,6,'Operator GPOS','Baik','inventories/iwkXdtNwP1uHD6NwQnCIxyIy4dCkxWvhOFMuZ627.jpg','2026-01-02',NULL,'2026-08-27 18:58:42','2026-08-27 21:09:46'),(88,'LAP/PRO/006',3,23,6,'Vacant','Baik',NULL,'2026-01-02','AMD E1-7010 RAM 2 GB Hardisk 500 GB','2026-08-27 18:58:45','2026-08-27 18:58:45'),(89,'M/MGSK/GPOS/008',8,26,6,'Operator GPOS','Baik','inventories/AeTRakuvYKdA5YI5a2vv6EFfFYLvijVu9I9FHfIb.jpg','2026-01-02',NULL,'2026-08-27 18:59:28','2026-08-27 21:09:16'),(90,'M/MGSK/GPOS/009',8,26,6,'Operator GPOS','Baik',NULL,'2026-01-02',NULL,'2026-08-27 18:59:52','2026-08-27 18:59:52'),(91,'LAP/PRO/007',3,23,6,'Vacant','Baik',NULL,'2026-01-02','Intel Celeron N2840 RAM 2 GB Hardisk 500 GB','2026-08-27 19:00:02','2026-08-27 19:00:02'),(92,'M/MGSK/GPOS/010',8,26,6,'Operator GPOS','Baik','inventories/UHvhTPJfU1dFebntPhwCfNwKCcJwtZTdKN3vkXJr.jpg','2026-01-02',NULL,'2026-08-27 19:00:15','2026-08-27 21:23:03'),(93,'M/MGSK/GPOS/011',8,26,6,'Operator GPOS','Baik','inventories/fbIRqpN9Z0SigyUzuYpWAHCTq3WWxcHAUWJyBZny.jpg','2026-01-02',NULL,'2026-08-27 19:00:37','2026-08-27 21:22:28'),(94,'M/MGSK/GPOS/012',8,26,6,'Operator GPOS','Baik','inventories/IN6weoeNsicpejngXlqCRB9gRLCzUokvTq0ZZgNx.jpg','2026-01-02',NULL,'2026-08-27 19:01:00','2026-08-27 21:21:47'),(95,'E/KOM/PP/001',2,24,16,'Staf PP 1','Baik','inventories/UMIeYw6Pej4f5DeltIeX7Fg2UZaIoru1OHngRiGn.jpg','2026-01-02','Core i3 RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:01:20','2026-08-27 20:41:28'),(96,'M/MPK/GPOS/001',8,26,6,'Op Potong Knitting','Baik','inventories/E7qF1GL5Ba1mxstMJgo0jyaxueslUz5qSifrfbLZ.jpg','2026-01-02','Mesin Potong Knitting Flare','2026-08-27 19:02:25','2026-08-27 21:42:01'),(97,'LAP/IC/001',3,35,17,'Manajer IC','Baik','inventories/imRHo9FH6qirniumC94TQM6eJ9xk8y8ORwdI9mRw.jpg','2026-01-02','Core i3 10110U RAM 4 GB SSD 256 GB','2026-08-27 19:02:26','2026-08-27 21:04:40'),(98,'E/KOM/PP/002',2,24,16,'Vacant','Baik','inventories/Tw8s2B53mL3pjxaC4os9ol8luX9iXFxQ8UxLZ8ne.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:02:30','2026-08-27 20:41:46'),(99,'M/MPK/GPOS/002',8,26,6,'Op Potong Knitting','Baik','inventories/mbVEFcqGPC2kbuIrxkeMiFTYsrzVl1Zbmh8EQ4js.jpg','2026-01-02','Mesin Potong Knitting Flare','2026-08-27 19:03:12','2026-08-27 21:41:28'),(100,'M/MPK/GPOS/003',8,26,6,'Op Potong Knitting','Baik','inventories/xMQbtmuPQ7BnfNx4Jvu6ih6JgfqwLV22BoeqCDJ6.jpg','2026-01-02','Mesin Potong Knitting Reguler','2026-08-27 19:03:52','2026-08-27 21:40:34'),(101,'LAP/MK/001',3,24,7,'Manajer MK','Baik','inventories/z9wqG471XFwP1w6JExSiuN7580qhXUlRGhJuZjXu.jpg','2026-01-02','AMD E1-6010 Ram 4 GB SSD 256 GB','2026-08-27 19:03:57','2026-08-27 20:46:47'),(102,'E/KOM/PRO/001',2,26,6,'Kabag GPOS','Baik',NULL,'2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:04:49','2026-08-27 23:29:26'),(103,'M/MPK/GPOS/004',8,26,6,'Op Potong Knitting','Baik','inventories/IGkD0ZJbaCKlmAT8fqPNHo8e4agQzir2SWJeL0mh.jpg','2026-01-02','Mesin Potong Knitting Reguler','2026-08-27 19:04:50','2026-08-27 21:40:02'),(104,'E/KOM/PRO/002',2,33,6,'Kabag Gulung','Baik','inventories/x1zMhlyaIVvbqiFN93h6Td3DEnxzBrpLxgstsTtj.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:05:43','2026-08-27 20:53:51'),(105,'LAP/MK/002',3,36,7,'Vacant','Baik','inventories/xtBkbU1bDaSdZ8x3IiF7sPqfmlz75CKRghEW3xsD.jpg','2026-01-02','Intel Celeron N2840 RAM 2 GB SSD 512 GB','2026-08-27 19:05:53','2026-08-27 20:42:46'),(106,'M/MP/BOPT/001',8,34,6,'Operator Buka Oven','Baik',NULL,'2026-01-02','Mesin Penanak','2026-08-27 19:06:36','2026-08-27 19:06:36'),(107,'M/MP/BOPT/002',8,34,6,'Operator Buka Oven','Baik',NULL,'2026-01-02','Mesin Penanak','2026-08-27 19:07:19','2026-08-27 19:07:19'),(108,'LAP/QC/001',3,24,18,'Manajer QC','Baik','inventories/irkjLvKnnf4jZ0qHTJTz6qmPk7f89EuJwXSfxFMD.jpg','2023-01-01','Core i3-1115G4  RAM 4 GB SSD 256 GB','2026-08-27 19:07:19','2026-08-27 20:35:37'),(109,'LAP/FB/001',3,25,14,'Staf FB','Baik','inventories/W8p4QGm6eYHzFfwn4j4PquweozWeMxUQyYwl9CMM.jpg','2026-01-02','Intel Celeron N2840  RAM 2 GB SSD 120 GB','2026-08-27 19:08:53','2026-08-27 21:38:21'),(110,'E/KOM/PRO/003',2,33,6,'Koordinator Gulung','Baik','inventories/nBnSyWWARTkX6c5tuQ77R2l67BkfMpIXJwnpWFZo.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:09:04','2026-08-27 20:53:31'),(111,'LAP/WM/001',3,16,10,'WM','Baik',NULL,'2026-01-02','Core i3 10110U RAM 4 GB SSD 256 GB','2026-08-27 19:10:09','2026-08-27 19:10:09'),(112,'M/MPK/GPO/001',8,38,6,'Operator GPOS','Baik','inventories/qvLpGTC8Pi1ivY0PYNEojChmL3z9DY7tkEHMxlak.jpg','2026-01-02','Kompresor 10 HP','2026-08-27 19:10:16','2026-08-27 21:19:43'),(113,'E/KOM/PRO/004',2,19,6,'Kabag Oven','Baik',NULL,'2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:10:48','2026-08-27 21:48:20'),(114,'E/KOM/PRO/005',2,34,6,'Kabag BO PTB','Baik','inventories/Gn48PIEz0DSUUOBY35MSMgP5obnDB3TePDanX8Xr.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:11:27','2026-08-27 20:52:06'),(115,'LAP/KEU/001',3,9,3,'Manajer keuangan','Baik','inventories/DHRsT2zjDmLNcBD3vZqkZ3PKgaFrdwu7LIbCbKty.jpg','2026-01-02','Core i3 6006U RAM 8 GB SSD 512 GB','2026-08-27 19:11:33','2026-08-27 21:02:37'),(116,'M/MTK/TNM/001',8,37,6,'Operator Tanam','Baik','inventories/TeB8axb4tC34JcRhqdOdwJP3nQiwEJxPF7sPaRPD.jpg','2026-01-02','Mesin Panggang Tray Kertas','2026-08-27 19:11:54','2026-08-27 21:38:52'),(117,'E/KOM/PRO/006',2,34,6,'Admin BO PTB','Baik','inventories/2xyq8lGN3y4kOg3kHhsVGQIJjD6Q3UYXM1o3P8nW.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:12:23','2026-08-27 20:51:41'),(118,'M/MTK/TNM/002',8,37,6,'Operator Tanam','Baik','inventories/ZaHwWE1e5iZ7ZsoWmmPEZ71RMs5AMq2yAOHTWnCH.jpg','2026-01-02','Mesin Panggang Tray Kertas','2026-08-27 19:12:46','2026-08-27 21:37:55'),(119,'LAP/SC/001',3,27,8,'Manajer SC','Baik',NULL,'2026-01-02','Core i3 10110U RAM 4 GB SSD 256 GB','2026-08-27 19:13:13','2026-08-27 19:13:13'),(120,'M/MTK/TNM/003',8,37,6,'Operator Tanam','Baik','inventories/C3GvfcGUIccMT8zrurJyhrXBKMhgVESU9Bc8F7zz.jpg','2026-01-02','Mesin Panggang Tray Kertas','2026-08-27 19:13:18','2026-08-27 21:37:00'),(121,'M/MTK/TNM/004',8,37,6,'Operator Tanam','Baik','inventories/OwyYTQjtDxHAbNdUCv1hj9UCL8azGQin7HU2rSql.jpg','2026-01-02','Mesin Panggang Tray Kertas','2026-08-27 19:13:46','2026-08-27 21:36:18'),(122,'M/MTK/TNM/005',8,37,6,'Operator Tanam','Baik','inventories/V1xNyRyxQuSJZwxtrXGHjfFE6iAm3ekPmJLLQwGR.jpg','2026-01-02','Mesin Panggang Tray Kertas','2026-08-27 19:14:16','2026-08-27 21:35:07'),(123,'E/KOM/PRO/007',2,39,6,'Kabag Gunting','Baik','inventories/3e1sy8HxddKxhLnNRaV2vKnZik33EYXiYJ6z9ro8.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 500 GB','2026-08-27 19:14:26','2026-08-27 20:51:08'),(124,'M/MTK/TNM/006',8,37,6,'Operator Tanam','Baik','inventories/XBy0G38mO6SHHo7dwLVSoNAvomv6ZrcPbNQ9ZLps.jpg','2026-01-02','Mesin Panggang Tray Kertas','2026-08-27 19:15:03','2026-08-27 21:34:03'),(125,'E/KOM/PRO/008',2,39,6,'Admin Gunting','Baik','inventories/2Rjok3yKb6bJ8nuIvXzXmWVviLgSwUwcHo5KLjLL.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:15:10','2026-08-27 20:50:31'),(126,'M/MTK/TNM/007',8,37,6,'Operator Tanam','Baik','inventories/BoUzQeb4LkBGHpAC2WsqOQlI0S5VW0uuqhTjCKTL.jpg','2026-01-02','Mesin Panggang Tray Kertas','2026-08-27 19:15:46','2026-08-27 21:47:16'),(127,'E/KOM/PRO/009',2,40,6,'Kabag Pasang','Baik','inventories/BRpg5d1HdTQmT0WOlhPxAQFEA0yp2OLGjSCUSQTG.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 500 GB','2026-08-27 19:15:59','2026-08-27 20:49:38'),(128,'M/MTK/TNM/008',8,37,6,'Operator Tanam','Baik','inventories/hWsAuqTXNkrTC2AfqWuqWa67yb90prW22hVC9qCU.jpg','2026-01-02','Mesin Panggang Tray Kertas','2026-08-27 19:16:16','2026-08-27 21:46:43'),(129,'E/PRN/DIR/001',4,43,1,'Manajer HCE','Baik',NULL,'2024-04-16','Epson L3210','2026-08-27 19:16:52','2026-08-28 01:09:26'),(130,'E/KOM/PRO/010',2,37,6,'Kabag Tanam','Baik','inventories/6Uo9ujEH4u3ghDzOfPNK1D7zQk6QNQT1n7Me409i.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:16:58','2026-08-27 20:54:47'),(131,'M/MTK/TNM/009',8,37,6,'Operator Tanam','Baik','inventories/6ZfWyCHyFM91kwgyaVQOQt2gEsTDRAaoaexo1Oe4.jpg','2026-01-02','Mesin Panggang Tray Kertas','2026-08-27 19:17:08','2026-08-27 21:46:11'),(132,'E/KOM/PRO/011',2,41,6,'Operator Prod Inovasi','Baik',NULL,'2026-01-02','Core i3 RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:17:39','2026-08-27 19:17:39'),(133,'M/MTK/TNM/010',8,37,6,'Operator Tanam','Baik','inventories/NOJ4lykE54pkXAU6kEeZgKuWMVh7knn1UeOpTj0h.jpg','2026-01-02','Mesin Panggang Tray Kertas','2026-08-27 19:17:40','2026-08-27 21:44:37'),(134,'M/MTK/TNM/011',8,37,6,'Operator Tanam','Baik','inventories/cMVF84e84A7BN4CZV0xhMVS84eLsnA212BrPVqZi.jpg','2026-01-02','Mesin Panggang Tray Kertas','2026-08-27 19:18:08','2026-08-27 21:44:09'),(135,'E/KOM/PRO/012',2,42,6,'Kabag Finishing','Baik',NULL,'2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:18:17','2026-08-27 19:18:17'),(136,'E/PRN/FM/001',4,24,11,'FM','Baik','inventories/XAN7VAnqiCoE0zbT6eCNeWCk9EP8S1CVB2amF2E9.jpg','2023-04-10','Epson L3210','2026-08-27 19:18:25','2026-08-27 21:08:35'),(137,'M/MTK/TNM/012',8,37,6,'Operator Tanam','Baik','inventories/9y13UjkhhZXq925wLD9AoRWJfSqz4dzmj7Zda6N2.jpg','2026-01-02','Mesin Panggang Tray Kertas','2026-08-27 19:18:37','2026-08-27 21:43:41'),(138,'E/KOM/PRO/013',2,42,6,'Operator Finishing','Baik',NULL,'2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:19:10','2026-08-27 19:19:10'),(139,'M/MP/PSG/001',8,40,6,'Operator Pasang','Baik','inventories/4AD2RaGbPktgy6JIyZ3IGMt3bOe9bAlzyx1X49Wh.jpg','2026-01-02','Mesin Panggang','2026-08-27 19:19:45','2026-08-27 21:31:32'),(140,'E/KOM/IC/001',2,35,17,'Staf IC 1','Baik','inventories/IJSBMbvZzKbjCmLoXeowMUTBF5NpsimmUEjF6gTs.jpg','2026-01-02','Core i3 RAM 4 GB, Hard Disk 500 GB','2026-08-27 19:20:05','2026-08-27 21:06:42'),(141,'M/MP/PSG/002',8,40,6,'Operator Pasang','Baik','inventories/cTzRRwipzSha7k1W8t0sOdRfK13dq1AabS0ngZlu.jpg','2026-01-02','Mesin Panggang','2026-08-27 19:20:40','2026-08-27 21:30:47'),(142,'E/KOM/IC/002',2,35,17,'Vacant','Baik','inventories/YcR8jtO5l1eY98rkLCY4l4rfWbIvb3XPRJ029pTx.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:20:59','2026-08-27 21:06:30'),(143,'E/KOM/IC/003',2,35,17,'Admin IC 1','Baik','inventories/NKZP407pDQpwz7mo3tr2O6yFkPgTlJEAe0Gdcf21.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:21:48','2026-08-27 21:06:14'),(144,'M/MP/PSG/003',8,40,6,'Operator Pasang','Baik','inventories/iGf7ehyebiOPXucUwIXKh71E0W30jf4sTFulkljj.jpg','2026-01-02','Mesin Panggang','2026-08-27 19:21:49','2026-08-27 21:29:16'),(145,'M/MP/PSG/004',8,40,6,'Operator Pasang','Baik','inventories/O1iJQHow8EI6oJFJcb1Lklo0CaNPhX1nhzOkao5L.jpg','2026-01-02','Mesin Panggang','2026-08-27 19:22:13','2026-08-27 21:28:34'),(146,'E/PRN/IC/001',4,35,17,'Manajer IC','Baik','inventories/OCoP75NcE8Uwh92auokQ69KURgaIrQdBujvr4rov.jpg','2025-10-30','Epson L3210','2026-08-27 19:22:37','2026-08-27 21:05:46'),(147,'M/MP/PSG/005',8,40,6,'Operator Pasang','Baik','inventories/tW5olQ8NoFrgwyiZYDHWRYkEsFn6NGLphPgFu3d5.jpg','2026-01-02','Mesin Panggang','2026-08-27 19:22:48','2026-08-27 21:27:38'),(148,'E/KOM/IC/004',2,35,17,'Admin IC 2','Baik','inventories/QdvOKcmoq8L2CHy0EyN1wjDgwOaWs9CDW6jkvFwZ.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:22:50','2026-08-27 21:06:00'),(149,'M/MP/PSG/006',8,40,6,'Operator Pasang','Baik','inventories/MIeWNvuaU06D2jNOcZXBTyjb24o4hEpJSI2IimAp.jpg','2026-01-02','Mesin Panggang','2026-08-27 19:23:15','2026-08-27 21:27:01'),(150,'E/KOM/MK/001',2,36,7,'Kabag MK','Baik','inventories/6BT25BgSuWsHPkhsiqndMHgLJfIJMTQ9jK1z7kp2.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 500 GB','2026-08-27 19:23:31','2026-08-27 20:43:49'),(151,'M/MP/PSG/007',8,40,6,'Operator Pasang','Baik','inventories/9Kb4AOhyoJr80rQ079LRr2jZmaGO5ZaMcEsfkOXt.jpg','2026-01-02','Mesin Panggang','2026-08-27 19:23:42','2026-08-27 21:26:12'),(152,'E/PRN/MK/001',4,36,7,'Kabag MK','Baik','inventories/i5EULvCCfDrCq140aqJbqRE8gCa0OL0ubDQnMlVE.jpg','2026-01-02','Canon IP2770','2026-08-27 19:24:03','2026-08-27 20:44:54'),(153,'M/MP/PSG/008',8,40,6,'Operator Pasang','Baik','inventories/8lK4XOt6xgTv0LH1JuXI2te5hIfongmlKyIL1d6Y.jpg','2026-01-02','Mesin Panggang','2026-08-27 19:24:10','2026-08-27 21:24:53'),(154,'E/KOM/MK/002',2,36,7,'Kabag MK','Baik','inventories/uWqHngAftZDRH92OdVAiiQmU45cDWNkR4ejUfRsG.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:24:42','2026-08-27 20:44:05'),(155,'M/MHP/FSG/001',8,42,6,'Operator Finishing','Baik',NULL,'2026-01-02','Hand Pallet Krisbow','2026-08-27 19:24:58','2026-08-27 19:24:58'),(156,'E/KOM/MK/003',2,36,7,'Vacant','Baik','inventories/6XKj1B8BxAcQZKSvzhwrBHSOtmyw0W6G9Rl2E1HY.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:25:28','2026-08-27 20:44:20'),(157,'E/PRN/FB/001',4,25,14,'Staf FB','Baik','inventories/UF3mhhnnw8GL9rbOsw1vKeHRl50Nal69VnsSHpuu.jpg','2021-08-19','Epson L120','2026-08-27 19:25:29','2026-08-27 21:38:49'),(158,'M/MGB/IC/001',8,35,17,'Operator IC','Baik','inventories/QWNptW2GuqofYhiykbPYhkoZRBsERGF3MN6DFQzl.jpg','2026-01-02','Mesin Gerenda Benang','2026-08-27 19:25:41','2026-08-27 21:04:21'),(159,'E/KOM/MK/004',2,36,7,'Vacant','Baik','inventories/2bwRrBf0E8A9UdMcRDwuXD2gcz8EArY3inRLdIkc.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:26:06','2026-08-27 20:44:37'),(160,'M/MPK/IC/001',8,35,17,'Operator IC','Baik','inventories/hDbir0aWLvAb4S4B9665cES9hT9PSDHUmayI5xHZ.jpg','2026-01-02','Mesin Pemotong Kertas','2026-08-27 19:26:19','2026-08-27 21:03:37'),(161,'E/PRN/MKT/001',4,11,4,'Manajer Marketing','Baik','inventories/feLnGrxQMAnEeOfG9GXl4JO85AyakaoXqDrkb05b.jpg','2025-12-11','Epson L3211','2026-08-27 19:26:48','2026-08-27 20:57:20'),(162,'M/MPK/IC/002',8,35,17,'Operator IC','Baik','inventories/6GiCygdvkH26qufATIs6w2liWSjyJgw57W2wGOKn.jpg','2026-01-02','Mesin Pemotong Kertas','2026-08-27 19:27:14','2026-08-27 21:03:19'),(163,'E/KOM/QC/001',2,24,18,'Staf QC 1','Baik','inventories/YP5vkdRjppSnlS7oUMwGTlYwKtx7dUd90lrbEcOf.jpg','2026-01-02','Core i3 RAM 2 GB, Hard Disk 500 GB','2026-08-27 19:27:47','2026-08-27 20:31:56'),(164,'E/PRN/WM/001',4,16,8,'WM','Baik',NULL,'2026-01-02','Epson L120','2026-08-27 19:28:32','2026-08-27 19:28:32'),(165,'E/PRN/RIC/001',4,28,15,'Manajer RIC','Baik',NULL,'2023-01-13','Epson L121','2026-08-27 19:30:19','2026-08-27 19:30:19'),(166,'E/PRN/SC/001',4,27,8,'Manajer SC','Baik',NULL,'2025-08-19','Epson L3110','2026-08-27 19:34:21','2026-08-27 19:34:21'),(167,'SCA/WM/001',5,16,10,'WM','Baik',NULL,'2026-01-02','Canon LED 120','2026-08-27 19:37:20','2026-08-27 19:37:20'),(168,'M/MVO/FB/001',8,25,14,'Operator FB','Baik','inventories/8Eg8csoL3w46QGwJv2d4TRMqDgzZa37V7zEVH0jw.jpg','2026-01-02','Mesin vacum otomatis','2026-08-27 19:39:11','2026-08-27 21:42:35'),(169,'E/HP/HCE/001',6,23,1,'Staf dan Kabag HCE','Baik',NULL,'2021-08-23','Redmi Note 9','2026-08-27 19:40:39','2026-08-27 21:53:48'),(170,'E/KOM/QC/002',2,24,18,'Staf QC 2','Baik','inventories/9yI1UwA8P7kkif2DBgvHdQR1oqvIsAa0aEn7BqAT.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:42:21','2026-08-27 20:32:55'),(171,'E/HP/MK/001',6,24,7,'Manajer MK','Baik','inventories/iQy9cw6G1OfKCRZnPpmJk6weJJOp4iDSQ7058vnk.jpg','2026-01-02','Oppo A5S','2026-08-27 19:42:55','2026-09-03 21:43:23'),(172,'E/KOM/QC/003',2,24,18,'Staf QA (Vacant)','Baik','inventories/KRmiZgh2zbn4aqNTrZgZENBOJ7xGWrrutqwBqqXs.jpg','2026-01-02','Core i3 RAM 4 GB, Hard Disk 120 GB','2026-08-27 19:43:07','2026-08-27 20:33:30'),(173,'M/MVM/FB/001',8,25,14,'Operator FB','Baik','inventories/KPzlz9X28xJlw7mQALp1uGJN9FRQSlQ8l5C2JsL1.jpg','2026-01-02','Mesin vakum manual','2026-08-27 19:43:14','2026-08-27 21:45:53'),(174,'M/MVM/FB/002',8,25,14,'Operator FB','Baik','inventories/SGZ1cIho1vsHW8cltvMwufGWAdfsVhVXwmLPHgTk.jpg','2026-01-02','Mesin vakum manual','2026-08-27 19:44:01','2026-08-27 21:46:08'),(175,'E/KOM/QC/004',2,44,18,'Admin QC 1','Baik','inventories/FuGFda726uAaG8Zu3XyjhRb9PB8LocBztHzLi9Ri.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:44:48','2026-08-27 20:34:10'),(176,'M/MS/FB/001',8,25,14,'Operator FB','Baik','inventories/f1lYP7sAimWTLNFU7cQDYvPvvBv53xE754xt4ojy.jpg','2026-01-02','Mesin stemping','2026-08-27 19:45:02','2026-08-27 21:44:27'),(177,'E/KOM/QC/005',2,44,18,'Admin QC 2 (Vacant)','Baik','inventories/gpYa31CC0lrVVIbnfMsa1jG7E7iq2xyrQdpyEUOU.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:45:23','2026-08-27 20:36:08'),(178,'E/KOM/QC/006',2,25,18,'Kabag QC','Baik','inventories/qFDADF4Cc71ec0GXvQmMGlh5SHxOOnHszcKJ9XZF.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:46:09','2026-08-27 20:36:37'),(179,'E/KOM/FB/001',2,25,14,'Admin FB (Vacant)','Baik','inventories/HrKpIVpovlQnZ2fSqkY0v2MKsk1KW177JAnXaIT0.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:46:48','2026-08-27 21:39:13'),(180,'M/MS/FB/002',8,25,14,'Operator FB','Baik','inventories/ng5kgH9spGTth7YL3MxOIY9oJBcrdCaxG62J0YVT.jpg','2026-01-02','Mesin stemping','2026-08-27 19:47:05','2026-08-27 21:44:41'),(181,'E/HP/SC/002',6,27,8,'Kantor Ruang SC','Baik',NULL,'2026-01-02','Oppo A5S','2026-08-27 19:47:09','2026-08-27 19:47:09'),(182,'E/KOM/FB/002',2,25,14,'Vacant','Baik','inventories/h6oUX044aohBae2I1aExtl6qnb6SdFwhSPiZkD50.jpg','2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:47:33','2026-08-27 21:39:02'),(183,'E/KOM/WM/001',2,16,10,'Document Control','Baik',NULL,'2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:48:28','2026-08-27 19:48:28'),(184,'E/KOM/WM/002',2,16,10,'Staf HSE','Baik',NULL,'2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:49:19','2026-08-27 19:49:19'),(185,'M/MS/FB/003',8,25,14,'Operator FB','Baik','inventories/xwPKlkwZHOHYzHO7wYpETBvnfkkLwJl5T5LCk9ap.jpg','2026-01-02','Mesin stemping','2026-08-27 19:49:29','2026-08-27 21:44:54'),(186,'E/KOM/WM/003',2,16,10,'Perawat (Vacant)','Baik',NULL,'2026-01-02','Dual Core RAM 2 GB, Hard Disk 320 GB','2026-08-27 19:49:55','2026-08-27 19:49:55'),(187,'M/MS/FB/004',8,25,14,'Operator FB','Baik','inventories/CzJCQ3Q5fFOsvdcO5GZ5uHuGlIWTb8rNE3YhrzZr.jpg','2026-01-02','Mesin stemping','2026-08-27 19:50:03','2026-08-27 21:45:13'),(188,'M/MS/FB/005',8,25,14,'Operator FB','Baik','inventories/ERROU4fvzCvrWnygmNHkAIZW5IuBHYRehlodqS4h.jpg','2026-01-02','Mesin stemping','2026-08-27 19:50:32','2026-08-27 21:45:30'),(189,'E/KOM/SC/002',2,27,8,'Vacant','Baik',NULL,'0026-12-02','Core i3 RAM 2 GB, Hard Disk 128 GB','2026-08-27 19:51:11','2026-08-27 19:51:11'),(190,'E/KOM/MKT/001',2,11,4,'Manajer Marketing','Baik','inventories/SDFEoI581bzbNt8lunH46GKLJXnoYore60ODvakw.jpg','2026-01-02','Core i5 RAM 4 GB, Hard Disk 512 GB','2026-08-27 20:02:34','2026-08-27 20:58:12'),(191,'E/KOM/MKT/002',2,11,4,'Spv Marketing','Baik','inventories/7H5MDWcpdVAcILs1EzKGIYNDWNFIwM7AmJfFpp6T.jpg','2026-01-02','Core i5 RAM 4 GB, Hard Disk 512 GB','2026-08-27 20:03:10','2026-08-27 20:57:55'),(192,'E/KOM/SC/001',2,27,8,'Kantor Ruang SC','Baik',NULL,'2026-01-02','Core i3 RAM 2 GB, Hard Disk 320 GB','2026-08-27 20:03:11','2026-08-27 20:03:11'),(193,'E/KOM/MKT/003',2,11,4,'Vacant','Baik','inventories/UZ63uUJ2OGX5goVgW5z7G8gPlZRTKl5XyLsFckEj.jpg','2026-01-02','Core i5 RAM 4 GB, Hard Disk 512 GB','2026-08-27 20:03:48','2026-08-27 20:57:36'),(194,'E/KOM/KEU/001',2,9,3,'Staf Keuangan 1','Baik','inventories/7gObLWNGAmKQ9bwMbxdiOw4XR1ztxkwVBdDpt9MY.jpg','2026-01-02','Core i3 RAM 4 GB, Hard Disk 250 GB','2026-08-27 20:04:29','2026-08-27 21:01:31'),(195,'E/KOM/RIC/006',2,28,15,'Vacant','Baik',NULL,'2026-01-02','Core i3 RAM 4 GB, Hard Disk 320 GB','2026-08-27 20:05:42','2026-08-27 20:05:42'),(196,'E/KOM/KEU/002',2,9,3,'Spv Accounting','Baik','inventories/ExyB3BwD1ZKGFQrFRwT8HHRGpbjEhxOflbqqBZur.jpg','2026-01-02','Core i3 RAM 4 GB, Hard Disk 256 GB','2026-08-27 20:06:37','2026-08-27 21:01:12'),(197,'E/KOM/RIC/005',2,28,15,'Vacant','Baik',NULL,'2026-01-02','Core i3 RAM 4 GB, Hard Disk 500 GB','2026-08-27 20:07:17','2026-08-27 20:07:17'),(198,'E/KOM/KEU/003',2,9,3,'Vacant','Baik','inventories/jIPAfL5LSSc9PmxsbHdbRBktz2HLvk9iTEIpSvHH.jpg','2026-01-02','Core i3 RAM 4 GB, Hard Disk 320 GB','2026-08-27 20:07:35','2026-08-27 21:00:54'),(199,'E/KOM/KEU/004',2,9,3,'Vacant','Baik','inventories/kZhkIpNTZkiJnLZfUk9CdRjuKoBV9A10rPuyAp2z.jpg','2026-01-02','Core i3 RAM 4 GB, Hard Disk 320 GB','2026-08-27 20:08:26','2026-08-27 21:00:37'),(200,'E/KOM/RIC/004',2,28,15,'Kabag Sampel','Baik',NULL,'2026-01-02','Dual Core RAM 2 GB, Hard Disk 500 GB','2026-08-27 20:08:47','2026-08-27 20:08:47'),(201,'M/MPT/FB/001',8,25,14,'Operator FB','Baik','inventories/tNxsF7qbNoRBOhcdizAnsUVoskeroe8jqGzshJe1.jpg','2026-01-02','Mesin Pencacah Tray','2026-08-27 20:10:19','2026-08-28 01:54:23'),(202,'E/KOM/RIC/003',2,28,15,'Operator RIC','Baik',NULL,'2026-01-02','Core i3 RAM 4 GB, Hard Disk 500 GB','2026-08-27 20:10:26','2026-09-03 19:46:24'),(203,'M/GEN/FB/002',9,25,14,'FB/Umum','Baik',NULL,'2026-01-02',NULL,'2026-08-27 20:10:39','2026-08-27 20:10:39'),(204,'M/MP/FB/002',8,25,14,'Operator FB','Baik','inventories/5dZCIfXrWCJJjmcuvgAhgA37dwnleDIFge7QhTe6.jpg','2026-01-02','Mesin PON Kukdong','2026-08-27 20:10:47','2026-08-27 21:41:06'),(205,'M/MP/FB/003',8,25,14,'Operator FB','Baik','inventories/foRffGlgr41BFoV4uj8iACvrYazkJaIHV2BPCV5I.jpg','2026-01-02','Mesin PON Kukdong','2026-08-27 20:11:17','2026-08-27 21:40:51'),(206,'M/MP/FB/004',8,25,14,'Operator FB','Baik','inventories/Y6kJksLNfEQM9o1QfMWQPu80Lq0Byg5TKuz2g7eh.jpg','2026-01-02','Mesin PON Empang','2026-08-27 20:11:45','2026-08-27 21:40:37'),(207,'E/KOM/RIC/002',2,28,15,'Staf Inovasi &PE','Baik',NULL,'2026-01-02','Core i3 RAM 4 GB, Hard Disk 500 GB','2026-08-27 20:12:06','2026-08-27 20:12:06'),(208,'E/KOM/RIC/001',2,28,15,'Manajer RIC','Baik',NULL,'2026-01-02','Core i3 RAM 4 GB, Hard Disk 500 GB','2026-08-27 20:13:30','2026-08-27 20:13:30'),(209,'M/MP/FB/005',8,25,14,'Operator FB','Baik','inventories/zX5fVh7brXHJIyDkfq8fADZq3f3IPmITe2F0z6a0.jpg','2026-01-02','Mesin PON Empang','2026-08-27 20:14:50','2026-08-27 21:40:23'),(210,'M/MP/FB/006',8,25,14,'Operator FB','Baik','inventories/eBDP2GUj9qrFZI6JEvyoH4fxgQ6YgPEDyR0mZxhw.jpg','2026-01-02','Mesin PON Empang','2026-08-27 20:15:26','2026-08-27 21:40:09'),(211,'M/MP/FB/007',8,25,14,'Operator FB','Baik','inventories/GD1auOPq0bzVXeDQDJ29BwgamhnORdXddpwEgnJL.jpg','2026-01-02','Mesin PON Empang','2026-08-27 20:15:51','2026-08-27 21:43:00'),(212,'M/MGSK/RIC/001',8,28,15,'OPerator RIC','Baik',NULL,'2026-01-02','Mesin Gosok','2026-08-27 20:16:12','2026-08-27 20:16:12'),(213,'M/MP/FB/008',8,25,14,'Operator FB','Baik','inventories/GXy1N1xqWqj3Yrkpu3R2trFx4cu2nv49xLIJdVy6.jpg','2026-01-02','Mesin PON Empang','2026-08-27 20:16:18','2026-08-27 21:43:18'),(214,'M/MPLBG/FB/001',8,25,14,'Operator FB','Baik','inventories/8MbBJ714OI8OSF79kNDgGWPl9cTkqFVa3PTYdLiw.jpg','2026-01-02','Mesin Pelubang','2026-08-27 20:16:49','2026-08-27 21:43:45'),(215,'M/MPLBG/FB/002',8,25,14,'Operator FB','Baik','inventories/XRwMkhCZ4gYwBDSN03lIA5dyqTOQdRi8PVYsxrRa.jpg','2026-01-02','Mesin Pelubang','2026-08-27 20:17:24','2026-08-27 21:44:09'),(216,'M/MPLBG/FB/003',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Pelubang','2026-08-27 20:17:49','2026-08-27 20:17:49'),(217,'M/CNC/RIC/001',8,28,15,'Operator RIC','Baik',NULL,'2026-01-02','Mesin CNC','2026-08-27 20:17:56','2026-08-27 20:17:56'),(218,'M/BD/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Bor duduk','2026-08-27 20:18:18','2026-08-27 20:18:18'),(219,'M/BD/FB/002',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Bor duduk','2026-08-27 20:18:43','2026-08-27 20:18:43'),(220,'M/M6D/RIC/002',8,28,15,'Operator RIC','Baik',NULL,'2026-01-02','Mesin 6D','2026-08-27 20:18:56','2026-09-03 19:47:07'),(221,'M/MPD/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Padprint','2026-08-27 20:19:42','2026-08-27 20:28:35'),(222,'M/M6D/RIC/001',8,28,15,'Operator RIC','Baik',NULL,'2026-01-02','Mesin 6D','2026-08-27 20:20:09','2026-08-27 20:20:09'),(223,'M/MOV/RIC/001',8,28,15,'Operator RIC','Baik',NULL,'2026-01-02','Mesin Oven','2026-08-27 20:21:52','2026-08-27 20:21:52'),(224,'M/MPP/RIC/001',8,28,15,'Operator RIC','Baik',NULL,'2026-01-02','Mesin Panggang Portable','2026-08-27 20:23:13','2026-08-27 20:23:13'),(225,'M/MH/HSE/001',8,45,10,'HSE/Umum','Baik',NULL,'2026-01-02','Hidrant','2026-08-27 20:25:09','2026-08-27 20:25:09'),(226,'M/MM/FB/002',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Mellow','2026-08-27 20:26:41','2026-08-27 20:26:41'),(227,'M/MM/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Mellow','2026-08-27 20:28:28','2026-08-27 20:28:28'),(228,'M/MFE/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Flare Extention','2026-08-27 20:29:39','2026-08-27 20:29:39'),(229,'M/MCM/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Cetak Manual','2026-08-27 20:30:54','2026-08-27 20:30:54'),(230,'M/MR/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Runcing','2026-08-27 20:31:00','2026-08-27 20:31:00'),(231,'M/MK30/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Kompressor 30hp','2026-08-27 20:31:19','2026-08-27 20:31:19'),(232,'M/MHP/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Hand Pallet Krisbow','2026-08-27 20:31:48','2026-08-27 20:31:48'),(233,'M/MPS/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Panggang Slongsong','2026-08-27 20:32:24','2026-08-27 20:32:24'),(234,'M/MSD/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Simles','2026-08-27 20:34:36','2026-08-27 20:34:36'),(235,'M/M3D/FB/006',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin 3D Reguler','2026-08-27 20:35:41','2026-08-27 20:35:41'),(236,'M/M3D/FB/005',8,25,14,'Operator FB','Baik',NULL,'0206-01-02','Mesin 3D Reguler','2026-08-27 20:36:37','2026-08-27 20:36:37'),(237,'M/M3D/FB/004',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin 3D Reguler','2026-08-27 20:37:40','2026-08-27 20:37:40'),(238,'M/M3D/FB/003',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin 3D Reguler','2026-08-27 20:38:38','2026-08-27 20:38:38'),(239,'M/M3D/FB/002',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin 3D Mellow','2026-08-27 20:39:50','2026-08-27 20:39:50'),(240,'M/M3D/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin 3D Mellow','2026-08-27 20:40:48','2026-08-27 21:03:04'),(241,'M/MPP/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Pres','2026-08-27 20:41:12','2026-08-27 20:41:12'),(242,'M/MPP/FB/002',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Pres','2026-08-27 20:41:35','2026-08-27 20:41:35'),(243,'M/MK2/FB/004',8,25,14,'Operator FB','Baik',NULL,'2026-12-02','Mesin Kompressor 2hp','2026-08-27 20:41:49','2026-08-27 20:41:49'),(244,'M/MPP/FB/003',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Pres','2026-08-27 20:42:02','2026-08-27 20:42:02'),(245,'M/MK/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Kompressor 2hp','2026-08-27 20:42:27','2026-08-27 20:42:27'),(246,'M/MK2/FB/003',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Kompressor 2hp','2026-08-27 20:42:39','2026-08-27 20:42:39'),(247,'M/MK2/FB/002',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin Kompressor 2hp','2026-08-27 20:42:54','2026-08-27 20:42:54'),(248,'M/MP/FB/001',8,25,14,'Operator FB','Baik',NULL,'2026-01-02','Mesin PON Kukdong','2026-08-28 01:57:18','2026-08-28 01:57:18');
/*!40000 ALTER TABLE `inventories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_maintenances`
--

DROP TABLE IF EXISTS `inventory_maintenances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory_maintenances` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `inventory_id` bigint(20) unsigned NOT NULL,
  `tanggal_perawatan` date NOT NULL,
  `tanggal_perawatan_selanjutnya` date DEFAULT NULL,
  `jenis_perawatan` varchar(255) NOT NULL,
  `pelaksana` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_maintenances_inventory_id_foreign` (`inventory_id`),
  CONSTRAINT `inventory_maintenances_inventory_id_foreign` FOREIGN KEY (`inventory_id`) REFERENCES `inventories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_maintenances`
--

LOCK TABLES `inventory_maintenances` WRITE;
/*!40000 ALTER TABLE `inventory_maintenances` DISABLE KEYS */;
INSERT INTO `inventory_maintenances` VALUES (2,7,'2026-04-08','2026-06-07','Tune up standar, spooring 3D, ganti busi toyota, dan ganti oli.','Gunawan Motor','2026-08-14 02:06:36','2026-08-14 02:06:36'),(3,7,'2026-05-20','2026-07-19','Scanner','Gunawan Motor','2026-08-14 02:08:15','2026-08-14 02:08:15'),(4,7,'2026-07-28','2026-09-06','Spooring 3D dan ganti oli','Gunawan Motor','2026-08-14 02:12:04','2026-08-14 02:12:04'),(5,31,'2026-04-29','2026-08-28','Pembersihan unit AC','Solusi Teknik','2026-08-17 21:37:51','2026-08-17 21:37:51'),(6,31,'2026-08-07','2026-12-06','Pembersihan unit AC','Solusi Teknik','2026-08-17 21:41:58','2026-08-17 21:41:58'),(7,28,'2025-12-23','2026-06-22','Pembersihan unit AC','Solusi Teknik','2026-08-17 23:07:32','2026-08-17 23:07:32'),(8,28,'2026-05-23','2026-09-22','Pembersihan unit AC','Solusi Teknik','2026-08-17 23:08:26','2026-08-17 23:08:26'),(9,31,'2026-10-29','2026-10-31','Ganti Thermal','Staff IT',NULL,NULL),(10,129,'2026-10-26','2026-10-27','Ganti Thermal 2','Staff IT',NULL,NULL);
/*!40000 ALTER TABLE `inventory_maintenances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_mutations`
--

DROP TABLE IF EXISTS `inventory_mutations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory_mutations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `inventory_id` bigint(20) unsigned NOT NULL,
  `jenis` enum('Pemindahan','Pemusnahan') NOT NULL,
  `tanggal` date NOT NULL,
  `alasan` text NOT NULL,
  `dokumen` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_mutations_inventory_id_foreign` (`inventory_id`),
  CONSTRAINT `inventory_mutations_inventory_id_foreign` FOREIGN KEY (`inventory_id`) REFERENCES `inventories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_mutations`
--

LOCK TABLES `inventory_mutations` WRITE;
/*!40000 ALTER TABLE `inventory_mutations` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_mutations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_repairs`
--

DROP TABLE IF EXISTS `inventory_repairs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory_repairs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `inventory_id` bigint(20) unsigned NOT NULL,
  `tanggal_pengajuan` date NOT NULL,
  `tanggal_tindak_lanjut` date DEFAULT NULL,
  `dokumen` varchar(255) DEFAULT NULL,
  `jenis_perbaikan` varchar(255) NOT NULL,
  `pelaksana` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_repairs_inventory_id_foreign` (`inventory_id`),
  CONSTRAINT `inventory_repairs_inventory_id_foreign` FOREIGN KEY (`inventory_id`) REFERENCES `inventories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_repairs`
--

LOCK TABLES `inventory_repairs` WRITE;
/*!40000 ALTER TABLE `inventory_repairs` DISABLE KEYS */;
INSERT INTO `inventory_repairs` VALUES (2,7,'2026-07-28',NULL,NULL,'Ganti ban depan kanan 1 pcs','Gunawan Motor','2026-08-14 02:11:08','2026-08-14 02:11:08');
/*!40000 ALTER TABLE `inventory_repairs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_stock_opnames`
--

DROP TABLE IF EXISTS `inventory_stock_opnames`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory_stock_opnames` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `inventory_id` bigint(20) unsigned NOT NULL,
  `tanggal` date NOT NULL,
  `kondisi` varchar(255) NOT NULL,
  `auditor` varchar(255) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `dokumen` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_stock_opnames_inventory_id_foreign` (`inventory_id`),
  CONSTRAINT `inventory_stock_opnames_inventory_id_foreign` FOREIGN KEY (`inventory_id`) REFERENCES `inventories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_stock_opnames`
--

LOCK TABLES `inventory_stock_opnames` WRITE;
/*!40000 ALTER TABLE `inventory_stock_opnames` DISABLE KEYS */;
INSERT INTO `inventory_stock_opnames` VALUES (7,7,'2025-12-10','Baik','FM','stock-opnames/N8mwlyaKHSy3v1aaID7TzFXLNiBx0qBCGSCTRYwC.jpg',NULL,'2026-08-14 02:17:16','2026-08-14 02:17:16'),(8,7,'2026-06-18','Baik','FM','stock-opnames/ny7HEVlRdhfTYQQzMf8zuDAuCUsTYFgkxKlkK4yd.jpg',NULL,'2026-08-14 02:17:52','2026-08-14 02:17:52'),(9,31,'2025-12-10','Baik','Afid','stock-opnames/YMgbAEy7ruXocxzrIAr4NHn4LfY8tWYag6j4OROF.jpg',NULL,'2026-08-17 21:47:32','2026-08-17 21:47:32'),(10,31,'2026-06-18','Baik','Afid','stock-opnames/2AHn2GoN10QxT4GBreMQPljkHljBvWYaA2g3jDHI.jpg',NULL,'2026-08-17 21:48:07','2026-08-17 21:48:07'),(11,28,'2025-12-10','Baik','Tia Kustiana','stock-opnames/2vwPeGMMRBr7X3tfnTSghXwh56fsNnqDFx7NlK5g.png',NULL,'2026-08-17 23:10:37','2026-08-17 23:10:37'),(12,28,'2026-06-18','Baik','Tia Kustiana','stock-opnames/J13gdG5cSTFUS1aDGSHlaypFwzePMxtpVOwDbb0U.png',NULL,'2026-08-17 23:10:58','2026-08-17 23:10:58');
/*!40000 ALTER TABLE `inventory_stock_opnames` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `locations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama_lokasi` varchar(255) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (7,'Perusahaan',NULL,'2026-07-31 01:06:29','2026-08-13 02:29:35'),(9,'Kantor Ruang Keuangan',NULL,'2026-07-31 01:19:38','2026-07-31 01:19:38'),(11,'Kantor Ruang Marketing',NULL,'2026-07-31 01:35:08','2026-07-31 01:35:08'),(16,'Kantor Ruang WM',NULL,'2026-07-31 01:53:46','2026-08-13 21:10:57'),(19,'Ruang Oven',NULL,'2026-07-31 02:08:09','2026-07-31 02:08:09'),(21,'Ruang Genset',NULL,'2026-07-31 02:15:38','2026-07-31 02:15:38'),(23,'Kantor Ruang HCE',NULL,'2026-08-13 19:36:50','2026-08-13 19:36:50'),(24,'Kantor Ruang Tengah',NULL,'2026-08-13 21:05:08','2026-08-13 21:05:08'),(25,'Ruang FB',NULL,'2026-08-13 21:11:52','2026-08-13 21:11:52'),(26,'Ruang GPOS',NULL,'2026-08-13 21:14:27','2026-08-13 21:14:27'),(27,'Kantor Ruang SC',NULL,'2026-08-14 01:29:19','2026-08-14 01:29:19'),(28,'Ruang RIC',NULL,'2026-08-14 01:38:47','2026-08-14 01:38:47'),(29,'Pos Security',NULL,'2026-08-27 18:46:22','2026-08-27 18:48:33'),(30,'Ruang Server',NULL,'2026-08-27 18:46:41','2026-08-27 18:49:12'),(33,'Ruang Gulung',NULL,'2026-08-27 18:47:12','2026-08-27 18:48:52'),(34,'Ruang Buka Oven',NULL,'2026-08-27 18:47:46','2026-08-27 18:48:42'),(35,'Ruang IC',NULL,'2026-08-27 19:01:22','2026-08-27 19:01:22'),(36,'Ruang MK',NULL,'2026-08-27 19:04:52','2026-08-27 19:04:52'),(37,'Ruang Tanam',NULL,'2026-08-27 19:08:40','2026-08-27 19:08:40'),(38,'Gedung Area Gulung',NULL,'2026-08-27 19:09:24','2026-08-27 19:09:24'),(39,'Ruang Gunting',NULL,'2026-08-27 19:12:54','2026-08-27 19:12:54'),(40,'Ruang Pasang',NULL,'2026-08-27 19:13:00','2026-08-27 19:13:00'),(41,'Produksi Inovasi FB',NULL,'2026-08-27 19:13:22','2026-08-28 02:06:02'),(42,'Ruang Finishing',NULL,'2026-08-27 19:13:31','2026-08-27 19:13:31'),(43,'Kantor Ruang Direktur',NULL,'2026-08-27 19:19:24','2026-08-27 23:31:33'),(44,'Ruang QC',NULL,'2026-08-27 19:43:45','2026-08-27 19:43:45'),(45,'Taman',NULL,'2026-08-27 20:24:07','2026-08-27 23:30:41'),(46,'Kantor Ruang Meeting',NULL,'2026-08-27 23:28:04','2026-08-27 23:28:04'),(47,'Kantor Ruang Owner',NULL,'2026-08-28 00:59:05','2026-08-28 00:59:05'),(52,'contoh',NULL,'2026-10-31 14:14:20','2026-10-31 14:14:20');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `master_sarana_inventaris`
--

DROP TABLE IF EXISTS `master_sarana_inventaris`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `master_sarana_inventaris` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama_sarana_inventaris` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `master_sarana_inventaris`
--

LOCK TABLES `master_sarana_inventaris` WRITE;
/*!40000 ALTER TABLE `master_sarana_inventaris` DISABLE KEYS */;
INSERT INTO `master_sarana_inventaris` VALUES (1,'Kendaraan','2026-07-13 04:30:04','2026-07-13 04:30:04'),(2,'Komputer','2026-07-13 04:30:04','2026-07-13 04:30:04'),(3,'Laptop','2026-07-13 04:30:04','2026-07-13 04:30:04'),(4,'Printer','2026-07-13 04:30:04','2026-07-13 04:30:04'),(5,'Scanner','2026-07-13 04:30:04','2026-07-13 04:30:04'),(6,'Handhphone','2026-07-13 04:30:04','2026-07-13 04:30:04'),(7,'AC','2026-07-13 04:30:04','2026-07-21 23:19:41'),(8,'Mesin Produksi','2026-07-13 04:30:04','2026-07-13 04:30:04'),(9,'Genset','2026-07-13 04:30:04','2026-07-13 04:30:04');
/*!40000 ALTER TABLE `master_sarana_inventaris` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_06_28_105449_create_categories_table',1),(5,'2026_06_28_105453_create_locations_table',1),(6,'2026_06_28_111438_create_responsibles_table',1),(7,'2026_06_28_111442_create_inventories_table',1),(8,'2026_06_28_111446_create_inventory_maintenances_table',1),(9,'2026_06_28_111450_create_inventory_repairs_table',1),(10,'2026_06_28_111454_create_inventory_stock_opnames_table',1),(11,'2026_06_28_111457_create_inventory_mutations_table',1),(12,'2026_08_29_120008_add_role_and_responsible_id_to_users_table',2),(13,'2026_08_31_115547_update_users_table_for_username_login',2),(14,'2026_09_01_134606_update_inventory_repairs_table',2);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `responsibles`
--

DROP TABLE IF EXISTS `responsibles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `responsibles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama_penanggung_jawab` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `responsibles`
--

LOCK TABLES `responsibles` WRITE;
/*!40000 ALTER TABLE `responsibles` DISABLE KEYS */;
INSERT INTO `responsibles` VALUES (1,'HCE','2026-07-13 04:30:04','2026-07-13 04:30:04'),(3,'KEUANGAN','2026-07-13 04:30:04','2026-08-13 02:25:28'),(4,'MARKETING','2026-07-13 04:30:04','2026-08-13 02:26:49'),(6,'PRODUKSI','2026-07-31 01:29:46','2026-08-13 21:06:01'),(7,'MK','2026-07-31 01:44:50','2026-07-31 01:44:50'),(8,'SC','2026-07-31 01:48:37','2026-07-31 01:48:37'),(10,'WM','2026-07-31 01:54:46','2026-07-31 01:54:46'),(11,'FM','2026-07-31 01:59:51','2026-07-31 01:59:51'),(14,'FB','2026-07-31 02:18:15','2026-07-31 02:18:15'),(15,'RIC','2026-08-13 21:58:26','2026-08-13 21:58:26'),(16,'PP','2026-08-13 21:58:43','2026-08-13 21:58:43'),(17,'IC','2026-08-13 21:58:49','2026-08-13 21:58:49'),(18,'QC','2026-08-13 21:59:05','2026-08-13 21:59:05');
/*!40000 ALTER TABLE `responsibles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('D7sdSiV6fBfJuKaYbK6jlhYNm4GvIsozYljsrWYq',2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiRGZiQ3Q1S2xBaTkydG43NXlzdnZWb3dBY1dLUnhlWmxsQ2tDVGRqbyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NTg6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9pbnZlbnRhcmlzP3NlYXJjaD1FJTJGQUMlMkZIQ0UlMkYwMDEiO3M6NToicm91dGUiO3M6MTc6ImludmVudG9yaWVzLmluZGV4Ijt9czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6Mjt9',1793291432),('EVT4WoaDsFXNKHvRe6o0uXsfuUgnsWW5DCvmUcHq',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiTExVVE9JbVFXVTluakcxclFrODZ2NFdOcGRPSDZaU2NhWWZHSjJWQSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7czo5OiJkYXNoYm9hcmQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO30=',1793259640),('G65OCnS6O6hKeBxc0ikTrnqPdGrFXye1kHorvyQl',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoia25YTmdoUjlrNHZnQXZFeERQNHBaNHQ1VVJxcWlUTmoxQU1yUXdIUSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjk6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sYXBvcmFuIjtzOjU6InJvdXRlIjtzOjEzOiJyZXBvcnRzLmluZGV4Ijt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9',1793201946),('i8IPiE5cYclpEc0jmrROHkaYkntRHBsbyjwaMQiw',2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiTHBUTmlRNTJtcGFTZUJHWGVBMVd5VlU0WFJjVWp5dzJCTzFzMWdSWCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjg6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2thc2kiO3M6NToicm91dGUiO3M6MTU6ImxvY2F0aW9ucy5pbmRleCI7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjI7fQ==',1793365430),('TKmLopeJAd43EihafkOzrVIo8JOFCJCLmX0aOkz1',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoidm9mUDc3ZGNVcUlZTHc3WU1Vb1JmZjc4S0hYbmI3eklHUmgxNGhVciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9ha3VuIjtzOjU6InJvdXRlIjtzOjExOiJ1c2Vycy5pbmRleCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==',1793449146);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'responsible',
  `responsible_id` bigint(20) unsigned DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  KEY `users_responsible_id_foreign` (`responsible_id`),
  CONSTRAINT `users_responsible_id_foreign` FOREIGN KEY (`responsible_id`) REFERENCES `responsibles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin',NULL,'$2y$12$n3ov6KK3otG3CMctJ27Ew.wghhHQwyHfQLbuBTsWVaCxjN7iAGUoK','admin',NULL,NULL,'2026-09-02 19:29:46','2026-09-02 19:29:46'),(2,'HCE',NULL,'$2y$12$XL8NzyTaxi0.l9OlRnqE2uDz1LUB7aoqSZfbL3sWinnt67ki10r4S','responsible',1,NULL,'2026-10-29 08:04:18','2026-10-29 08:04:18'),(4,'FM',NULL,'$2b$10$SwEvRGwinwiDQdhCtyXd7ewhuk6Qwy5lWcBaeuvsTAskUnUaFVuwu','responsible',11,NULL,'2026-10-31 13:24:25','2026-10-31 13:24:25');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'sistem_inventaris'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-31 21:26:58
