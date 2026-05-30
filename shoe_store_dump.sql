-- MySQL dump 10.13  Distrib 8.4.9, for Win64 (x86_64)
--
-- Host: localhost    Database: shoe_store
-- ------------------------------------------------------
-- Server version	8.4.9

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `address_line` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1fa36y2oqhao3wgg2rw1pi459` (`user_id`),
  CONSTRAINT `FK1fa36y2oqhao3wgg2rw1pi459` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `actual_work_minutes` int NOT NULL,
  `approved_at` datetime(6) DEFAULT NULL,
  `check_in_at` datetime(6) DEFAULT NULL,
  `check_out_at` datetime(6) DEFAULT NULL,
  `early_leave_minutes` int NOT NULL,
  `late_minutes` int NOT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `overtime_minutes` int NOT NULL,
  `source` enum('ADMIN','SYSTEM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ABSENT','PRESENT','SCHEDULED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `schedule_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKeiom1c5rprdgqha2clu1ko73a` (`schedule_id`),
  CONSTRAINT `FK8dgv7113w7gduk3788du48g6a` FOREIGN KEY (`schedule_id`) REFERENCES `work_schedules` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blacklisted_tokens`
--

DROP TABLE IF EXISTS `blacklisted_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blacklisted_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `token` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKibvoggbe8ijw4l7xyyotp5n7g` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blacklisted_tokens`
--

LOCK TABLES `blacklisted_tokens` WRITE;
/*!40000 ALTER TABLE `blacklisted_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `blacklisted_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKoce3937d2f4mpfqrycbr0l93m` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (2,'Adidas'),(5,'FILA'),(7,'Jeep'),(3,'MLB'),(6,'New Balance'),(1,'Nike'),(4,'Puma');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `cart_id` bigint NOT NULL,
  `variant_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKnu5ubwpsshgdbogmqp78tg6ej` (`cart_id`,`variant_id`),
  KEY `FKlbfbpwnrjag6b2e1mw21l8ygu` (`variant_id`),
  CONSTRAINT `FKlbfbpwnrjag6b2e1mw21l8ygu` FOREIGN KEY (`variant_id`) REFERENCES `variants` (`id`),
  CONSTRAINT `FKpcttvuq4mxppo8sxggjtn5i2c` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `status` enum('ABANDONED','ACTIVE','CHECKED_OUT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `coupon_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK64t7ox312pqal3p7fg9o503c2` (`user_id`),
  KEY `FKb4abp6oso8eo5bqb5y0ggnfl5` (`coupon_id`),
  CONSTRAINT `FKb4abp6oso8eo5bqb5y0ggnfl5` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`),
  CONSTRAINT `FKb5o626f86h46m4s7ms6ginnop` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cashier_sessions`
--

DROP TABLE IF EXISTS `cashier_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cashier_sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `cashier_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `closed_at` datetime(6) DEFAULT NULL,
  `closing_cash` decimal(12,2) DEFAULT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `opened_at` datetime(6) NOT NULL,
  `opening_cash` decimal(12,2) NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cashier_sessions`
--

LOCK TABLES `cashier_sessions` WRITE;
/*!40000 ALTER TABLE `cashier_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `cashier_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKt8o6pivur7nn124jehx7cygw5` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (3,'Basketball'),(4,'Lifestyle'),(2,'Running'),(5,'Slip-on'),(1,'Sneakers');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon_usages`
--

DROP TABLE IF EXISTS `coupon_usages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_usages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `coupon_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3mvslb8gc0ac6501mfmvifgva` (`coupon_id`),
  KEY `FKs9yuckyrsqcsgmjsus1unapt4` (`order_id`),
  KEY `FK6mev6grxbqmt8l0jxvobfg70n` (`user_id`),
  CONSTRAINT `FK3mvslb8gc0ac6501mfmvifgva` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`),
  CONSTRAINT `FK6mev6grxbqmt8l0jxvobfg70n` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKs9yuckyrsqcsgmjsus1unapt4` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_usages`
--

LOCK TABLES `coupon_usages` WRITE;
/*!40000 ALTER TABLE `coupon_usages` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupon_usages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon_users`
--

DROP TABLE IF EXISTS `coupon_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_users` (
  `coupon_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`coupon_id`,`user_id`),
  KEY `FKo63tolis9bp84xo6p3en889bm` (`user_id`),
  CONSTRAINT `FKf3sqb521nnaiuukn8ci8ne6wl` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`),
  CONSTRAINT `FKo63tolis9bp84xo6p3en889bm` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_users`
--

LOCK TABLES `coupon_users` WRITE;
/*!40000 ALTER TABLE `coupon_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupon_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_value` decimal(12,2) NOT NULL,
  `end_at` datetime(6) NOT NULL,
  `max_discount_value` decimal(12,2) DEFAULT NULL,
  `minimum_order_amount` decimal(12,2) DEFAULT NULL,
  `start_at` datetime(6) NOT NULL,
  `status` enum('ACTIVE','DISABLED','EXPIRED','UPCOMING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('FIXED_AMOUNT','FREE_SHIPPING','PERCENTAGE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usage_limit` int NOT NULL,
  `used_count` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKeplt0kkm9yf2of2lnx6c1oy9b` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'2026-05-22 15:15:00.045215','2026-05-22 15:15:00.045215','GIAM50K','Gi?m 50K cho ??n h?ng t? 500K',50000.00,'2026-06-22 15:15:00.044212',NULL,500000.00,'2026-05-21 15:15:00.044212','ACTIVE','FIXED_AMOUNT',100,0),(2,'2026-05-22 15:15:00.050558','2026-05-22 15:15:00.050558','GIAM10PT','Gi?m 10% t?i ?a 100K',10.00,'2026-06-22 15:15:00.050559',100000.00,0.00,'2026-05-21 15:15:00.050559','ACTIVE','PERCENTAGE',200,0),(3,'2026-05-22 15:15:00.054557','2026-05-22 15:15:00.054557','FREESHIP','Mi?n ph? v?n chuy?n',30000.00,'2026-06-22 15:15:00.053557',NULL,1000000.00,'2026-05-21 15:15:00.053557','ACTIVE','FREE_SHIPPING',50,0);
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `open_shifts`
--

DROP TABLE IF EXISTS `open_shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `open_shifts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `assigned_at` datetime(6) DEFAULT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `planned_end_at` datetime(6) NOT NULL,
  `planned_start_at` datetime(6) NOT NULL,
  `status` enum('ASSIGNED','CANCELLED','OPEN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_date` date NOT NULL,
  `assigned_user_id` bigint DEFAULT NULL,
  `schedule_id` bigint DEFAULT NULL,
  `shift_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKlxn83ncqi842sd2pmfjpi6qa6` (`assigned_user_id`),
  KEY `FK9rkbgillqudoe85lnhev3b73j` (`schedule_id`),
  KEY `FKfe7156e7l41iki8da4sky63q8` (`shift_id`),
  CONSTRAINT `FK9rkbgillqudoe85lnhev3b73j` FOREIGN KEY (`schedule_id`) REFERENCES `work_schedules` (`id`),
  CONSTRAINT `FKfe7156e7l41iki8da4sky63q8` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`),
  CONSTRAINT `FKlxn83ncqi842sd2pmfjpi6qa6` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `open_shifts`
--

LOCK TABLES `open_shifts` WRITE;
/*!40000 ALTER TABLE `open_shifts` DISABLE KEYS */;
/*!40000 ALTER TABLE `open_shifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `color_snapshot` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `requested_return_quantity` int NOT NULL,
  `returned_quantity` int NOT NULL,
  `size_snapshot` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku_snapshot` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `order_id` bigint NOT NULL,
  `variant_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK2xi9i5p6yo1g5mmtvhjccq7rn` (`order_id`,`variant_id`),
  KEY `FKtq7mxki18i9ny52bs843qp74h` (`variant_id`),
  CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKtq7mxki18i9ny52bs843qp74h` FOREIGN KEY (`variant_id`) REFERENCES `variants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_histories`
--

DROP TABLE IF EXISTS `order_status_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_histories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `actor_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changed_at` datetime(6) NOT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('CANCELLED','CONFIRMED','DELIVERED','PENDING','PROCESSING','RETURNED','RETURN_REQUESTED','SHIPPING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKgair3047h1rin6u8y0fvc1fg5` (`order_id`),
  CONSTRAINT `FKgair3047h1rin6u8y0fvc1fg5` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_histories`
--

LOCK TABLES `order_status_histories` WRITE;
/*!40000 ALTER TABLE `order_status_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_status_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `discount_amount` decimal(12,2) NOT NULL,
  `final_price` decimal(12,2) NOT NULL,
  `note` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_fee` decimal(12,2) NOT NULL,
  `status` enum('CANCELLED','CONFIRMED','DELIVERED','PENDING','PROCESSING','RETURNED','RETURN_REQUESTED','SHIPPING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal_amount` decimal(12,2) NOT NULL,
  `coupon_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKdhk2umg8ijjkg4njg6891trit` (`order_code`),
  KEY `FKn1d1gkxckw648m2n2d5gx0yx5` (`coupon_id`),
  KEY `FK32ql8ubntj5uh44ph9659tiih` (`user_id`),
  CONSTRAINT `FK32ql8ubntj5uh44ph9659tiih` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKn1d1gkxckw648m2n2d5gx0yx5` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `method` enum('BANK_TRANSFER','COD','CREDIT_CARD','E_WALLET','MIXED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `provider` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('FAILED','PAID','PENDING','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK8vo36cen604as7etdfwmyjsxt` (`order_id`),
  UNIQUE KEY `UK8inpv30544qjykcwa6ck7pusy` (`transaction_code`),
  KEY `FKj94hgy9v5fw1munb90tar2eje` (`user_id`),
  CONSTRAINT `FK81gagumt0r8y3rmudcgpbk42l` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKj94hgy9v5fw1munb90tar2eje` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pos_payment_allocations`
--

DROP TABLE IF EXISTS `pos_payment_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pos_payment_allocations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `cash_received` decimal(12,2) DEFAULT NULL,
  `change_amount` decimal(12,2) NOT NULL,
  `method` enum('BANK_TRANSFER','COD','CREDIT_CARD','E_WALLET','MIXED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqqobcb3qdidtgwauo2ykoiscu` (`order_id`),
  CONSTRAINT `FKqqobcb3qdidtgwauo2ykoiscu` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pos_payment_allocations`
--

LOCK TABLES `pos_payment_allocations` WRITE;
/*!40000 ALTER TABLE `pos_payment_allocations` DISABLE KEYS */;
/*!40000 ALTER TABLE `pos_payment_allocations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pos_return_exchange_logs`
--

DROP TABLE IF EXISTS `pos_return_exchange_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pos_return_exchange_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `balance_amount` decimal(12,2) NOT NULL,
  `detail_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `exchange_amount` decimal(12,2) NOT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `returned_amount` decimal(12,2) NOT NULL,
  `type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKao9gro9waap0m4ca94b98e4nd` (`order_id`),
  CONSTRAINT `FKao9gro9waap0m4ca94b98e4nd` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pos_return_exchange_logs`
--

LOCK TABLES `pos_return_exchange_logs` WRITE;
/*!40000 ALTER TABLE `pos_return_exchange_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `pos_return_exchange_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `base_price` decimal(12,2) NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `name` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sizes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ACTIVE','DRAFT','INACTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_quantity` int DEFAULT NULL,
  `brand_id` bigint DEFAULT NULL,
  `category_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKostq1ec3toafnjok09y9l7dox` (`slug`),
  KEY `FKa3a4mpsfdf4d2y6r8ra3sc8mv` (`brand_id`),
  KEY `FKog2rp4qthbtt2lfyhfo32lsw9` (`category_id`),
  CONSTRAINT `FKa3a4mpsfdf4d2y6r8ra3sc8mv` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'2026-05-22 15:15:00.076658','2026-05-22 15:15:00.076658',1050000.00,'Gi?y FILA ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'FILA Elite Series 1','39,40,41','elite-series-1-1779437700073','ACTIVE',30,5,4),(2,'2026-05-22 15:15:00.085657','2026-05-22 15:15:00.085657',1100000.00,'Gi?y Jeep ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Jeep Elite Series 2','39,40,41','elite-series-2-1779437700085','ACTIVE',30,7,2),(3,'2026-05-22 15:15:00.097825','2026-05-22 15:15:00.097825',1150000.00,'Gi?y MLB ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'MLB Elite Series 3','39,40,41','elite-series-3-1779437700095','ACTIVE',30,3,5),(4,'2026-05-22 15:15:00.107990','2026-05-22 15:15:00.107990',1200000.00,'Gi?y New Balance ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'New Balance Elite Series 4','39,40,41','elite-series-4-1779437700106','ACTIVE',30,6,1),(5,'2026-05-22 15:15:00.118272','2026-05-22 15:15:00.118272',1250000.00,'Gi?y Nike ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Nike Elite Series 5','39,40,41','elite-series-5-1779437700117','ACTIVE',30,1,3),(6,'2026-05-22 15:15:00.130740','2026-05-22 15:15:00.130740',1300000.00,'Gi?y Puma ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Puma Elite Series 6','39,40,41','elite-series-6-1779437700130','ACTIVE',30,4,4),(7,'2026-05-22 15:15:00.140744','2026-05-22 15:15:00.140744',1350000.00,'Gi?y Adidas ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Adidas Elite Series 7','39,40,41','elite-series-7-1779437700139','ACTIVE',30,2,2),(8,'2026-05-22 15:15:00.154743','2026-05-22 15:15:00.154743',1400000.00,'Gi?y FILA ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'FILA Elite Series 8','39,40,41','elite-series-8-1779437700153','ACTIVE',30,5,5),(9,'2026-05-22 15:15:00.164741','2026-05-22 15:15:00.164741',1450000.00,'Gi?y Jeep ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Jeep Elite Series 9','39,40,41','elite-series-9-1779437700164','ACTIVE',30,7,1),(10,'2026-05-22 15:15:00.174741','2026-05-22 15:15:00.174741',1500000.00,'Gi?y MLB ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'MLB Elite Series 10','39,40,41','elite-series-10-1779437700173','ACTIVE',30,3,3),(11,'2026-05-22 15:15:00.184336','2026-05-22 15:15:00.184336',1550000.00,'Gi?y New Balance ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'New Balance Elite Series 11','39,40,41','elite-series-11-1779437700183','ACTIVE',30,6,4),(12,'2026-05-22 15:15:00.194341','2026-05-22 15:15:00.194341',1600000.00,'Gi?y Nike ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Nike Elite Series 12','39,40,41','elite-series-12-1779437700194','ACTIVE',30,1,2),(13,'2026-05-22 15:15:00.201842','2026-05-22 15:15:00.201842',1650000.00,'Gi?y Puma ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Puma Elite Series 13','39,40,41','elite-series-13-1779437700201','ACTIVE',30,4,5),(14,'2026-05-22 15:15:00.212862','2026-05-22 15:15:00.212862',1700000.00,'Gi?y Adidas ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Adidas Elite Series 14','39,40,41','elite-series-14-1779437700211','ACTIVE',30,2,1),(15,'2026-05-22 15:15:00.219839','2026-05-22 15:15:00.219839',1750000.00,'Gi?y FILA ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'FILA Elite Series 15','39,40,41','elite-series-15-1779437700219','ACTIVE',30,5,3),(16,'2026-05-22 15:15:00.228047','2026-05-22 15:15:00.228047',1800000.00,'Gi?y Jeep ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Jeep Elite Series 16','39,40,41','elite-series-16-1779437700228','ACTIVE',30,7,4),(17,'2026-05-22 15:15:00.234046','2026-05-22 15:15:00.234046',1850000.00,'Gi?y MLB ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'MLB Elite Series 17','39,40,41','elite-series-17-1779437700233','ACTIVE',30,3,2),(18,'2026-05-22 15:15:00.243048','2026-05-22 15:15:00.243048',1900000.00,'Gi?y New Balance ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'New Balance Elite Series 18','39,40,41','elite-series-18-1779437700243','ACTIVE',30,6,5),(19,'2026-05-22 15:15:00.251090','2026-05-22 15:15:00.251090',1950000.00,'Gi?y Nike ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Nike Elite Series 19','39,40,41','elite-series-19-1779437700251','ACTIVE',30,1,1),(20,'2026-05-22 15:15:00.263053','2026-05-22 15:15:00.263053',2000000.00,'Gi?y Puma ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Puma Elite Series 20','39,40,41','elite-series-20-1779437700262','ACTIVE',30,4,3),(21,'2026-05-22 15:15:00.275048','2026-05-22 15:15:00.275048',2050000.00,'Gi?y Adidas ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Adidas Elite Series 21','39,40,41','elite-series-21-1779437700272','ACTIVE',30,2,4),(22,'2026-05-22 15:15:00.286060','2026-05-22 15:15:00.286060',2100000.00,'Gi?y FILA ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'FILA Elite Series 22','39,40,41','elite-series-22-1779437700285','ACTIVE',30,5,2),(23,'2026-05-22 15:15:00.298049','2026-05-22 15:15:00.298049',2150000.00,'Gi?y Jeep ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Jeep Elite Series 23','39,40,41','elite-series-23-1779437700297','ACTIVE',30,7,5),(24,'2026-05-22 15:15:00.307057','2026-05-22 15:15:00.307057',2200000.00,'Gi?y MLB ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'MLB Elite Series 24','39,40,41','elite-series-24-1779437700306','ACTIVE',30,3,1),(25,'2026-05-22 15:15:00.317048','2026-05-22 15:15:00.317048',2250000.00,'Gi?y New Balance ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'New Balance Elite Series 25','39,40,41','elite-series-25-1779437700317','ACTIVE',30,6,3),(26,'2026-05-22 15:15:00.324830','2026-05-22 15:15:00.324830',2300000.00,'Gi?y Nike ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Nike Elite Series 26','39,40,41','elite-series-26-1779437700323','ACTIVE',30,1,4),(27,'2026-05-22 15:15:00.332827','2026-05-22 15:15:00.332827',2350000.00,'Gi?y Puma ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Puma Elite Series 27','39,40,41','elite-series-27-1779437700331','ACTIVE',30,4,2),(28,'2026-05-22 15:15:00.341818','2026-05-22 15:15:00.341818',2400000.00,'Gi?y Adidas ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Adidas Elite Series 28','39,40,41','elite-series-28-1779437700340','ACTIVE',30,2,5),(29,'2026-05-22 15:15:00.349811','2026-05-22 15:15:00.349811',2450000.00,'Gi?y FILA ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'FILA Elite Series 29','39,40,41','elite-series-29-1779437700348','ACTIVE',30,5,1),(30,'2026-05-22 15:15:00.359817','2026-05-22 15:15:00.359817',2500000.00,'Gi?y Jeep ch?nh h?ng ch?t l??ng cao. Thi?t k? hi?n ??i, tr? trung, ph? h?p v?i m?i ho?t ??ng th? thao v? ?i ch?i.',NULL,'Jeep Elite Series 30','39,40,41','elite-series-30-1779437700358','ACTIVE',30,7,3);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_products`
--

DROP TABLE IF EXISTS `promotion_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_products` (
  `promotion_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`promotion_id`,`product_id`),
  KEY `FK9rm5m4rnoamh56kxetmoe1kk9` (`product_id`),
  CONSTRAINT `FK9rm5m4rnoamh56kxetmoe1kk9` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKkn7hllhf1o8jjrolro4rqmxt7` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_products`
--

LOCK TABLES `promotion_products` WRITE;
/*!40000 ALTER TABLE `promotion_products` DISABLE KEYS */;
INSERT INTO `promotion_products` VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),(1,11),(1,12),(1,13),(1,14),(1,15),(1,16),(1,17),(1,18),(1,19),(1,20),(1,21),(1,22),(1,23),(1,24),(1,25),(1,26),(1,27),(1,28),(1,29),(1,30);
/*!40000 ALTER TABLE `promotion_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_variants`
--

DROP TABLE IF EXISTS `promotion_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_variants` (
  `promotion_id` bigint NOT NULL,
  `variant_id` bigint NOT NULL,
  PRIMARY KEY (`promotion_id`,`variant_id`),
  KEY `FKt3kn27py7q80k6draf8su3l7p` (`variant_id`),
  CONSTRAINT `FKaou492ddvbqq5qo55esmxamdr` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`),
  CONSTRAINT `FKt3kn27py7q80k6draf8su3l7p` FOREIGN KEY (`variant_id`) REFERENCES `variants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_variants`
--

LOCK TABLES `promotion_variants` WRITE;
/*!40000 ALTER TABLE `promotion_variants` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotion_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_value` decimal(12,2) NOT NULL,
  `end_at` datetime(6) NOT NULL,
  `max_discount_value` decimal(12,2) DEFAULT NULL,
  `name` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_at` datetime(6) NOT NULL,
  `status` enum('ACTIVE','DISABLED','ENDED','UPCOMING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('BUY_X_GET_Y','FIXED_AMOUNT','PERCENTAGE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKjdho73ymbyu46p2hh562dk4kk` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,'2026-05-22 15:15:00.419819','2026-05-22 15:15:00.419819','GLOBAL10','Ch??ng tr?nh gi?m gi? t? ??ng 10% cho t?t c? s?n ph?m tr?n h? th?ng',10.00,'2027-05-22 15:15:00.386819',NULL,'Gi?m 10% To?n B? S?n Ph?m','2026-05-21 15:15:00.386819','ACTIVE','PERCENTAGE');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `revoked` bit(1) NOT NULL,
  `token` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKghpmfn23vmxfu3spu3lfg4r2d` (`token`),
  KEY `FK1lih5y2npsf8u5o3vhdb9y0os` (`user_id`),
  CONSTRAINT `FK1lih5y2npsf8u5o3vhdb9y0os` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` enum('ADMIN','CUSTOMER','STAFF') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKofx66keruapi6vyqpv6f2or37` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'2026-05-22 15:14:59.461142','2026-05-22 15:14:59.461142','System Role: ADMIN','ADMIN'),(2,'2026-05-22 15:14:59.504056','2026-05-22 15:14:59.504056','System Role: STAFF','STAFF'),(3,'2026-05-22 15:14:59.510809','2026-05-22 15:14:59.510809','System Role: CUSTOMER','CUSTOMER');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_coupons`
--

DROP TABLE IF EXISTS `saved_coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_coupons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `coupon_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK96fal62j297nwtxdky7ymok4c` (`user_id`,`coupon_id`),
  KEY `FKmb7wd91ao1rogr9rw5odtsp8x` (`coupon_id`),
  CONSTRAINT `FK5720e8707p2q33c2a3bx887jn` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKmb7wd91ao1rogr9rw5odtsp8x` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_coupons`
--

LOCK TABLES `saved_coupons` WRITE;
/*!40000 ALTER TABLE `saved_coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_change_logs`
--

DROP TABLE IF EXISTS `schedule_change_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_change_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_value_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `old_value_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `open_shift_id` bigint DEFAULT NULL,
  `schedule_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKn79t1do6nmy5xijtd6di4cc16` (`open_shift_id`),
  KEY `FK9ntk3t86ec8fqnx4bhy22avx3` (`schedule_id`),
  CONSTRAINT `FK9ntk3t86ec8fqnx4bhy22avx3` FOREIGN KEY (`schedule_id`) REFERENCES `work_schedules` (`id`),
  CONSTRAINT `FKn79t1do6nmy5xijtd6di4cc16` FOREIGN KEY (`open_shift_id`) REFERENCES `open_shifts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_change_logs`
--

LOCK TABLES `schedule_change_logs` WRITE;
/*!40000 ALTER TABLE `schedule_change_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedule_change_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_swap_requests`
--

DROP TABLE IF EXISTS `schedule_swap_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_swap_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `review_note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  `status` enum('APPROVED','CANCELLED','PENDING','REJECTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_user_id` bigint NOT NULL,
  `schedule_id` bigint NOT NULL,
  `target_user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK11t6v3m9wt909js9bvehyqy0w` (`from_user_id`),
  KEY `FKn4x4g8a0f9iy3ovidgmskhpk5` (`schedule_id`),
  KEY `FKqkyhtwmxgkspi3pqpdke3bnhh` (`target_user_id`),
  CONSTRAINT `FK11t6v3m9wt909js9bvehyqy0w` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKn4x4g8a0f9iy3ovidgmskhpk5` FOREIGN KEY (`schedule_id`) REFERENCES `work_schedules` (`id`),
  CONSTRAINT `FKqkyhtwmxgkspi3pqpdke3bnhh` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_swap_requests`
--

LOCK TABLES `schedule_swap_requests` WRITE;
/*!40000 ALTER TABLE `schedule_swap_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedule_swap_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shifts`
--

DROP TABLE IF EXISTS `shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shifts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `break_minutes` int NOT NULL,
  `code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cross_day` bit(1) NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `end_time` time(6) NOT NULL,
  `max_staff` int NOT NULL,
  `min_staff` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `paid_break_minutes` int NOT NULL,
  `start_time` time(6) NOT NULL,
  `status` enum('ACTIVE','INACTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKabletknamc0wq2wva8xhe08a3` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shifts`
--

LOCK TABLES `shifts` WRITE;
/*!40000 ALTER TABLE `shifts` DISABLE KEYS */;
/*!40000 ALTER TABLE `shifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shippings`
--

DROP TABLE IF EXISTS `shippings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shippings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `address_line` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `delivered_at` datetime(6) DEFAULT NULL,
  `district` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `method` enum('EXPRESS','SAME_DAY','STANDARD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipped_at` datetime(6) DEFAULT NULL,
  `shipping_fee` decimal(12,2) NOT NULL,
  `status` enum('DELIVERED','FAILED','PACKING','PENDING','SHIPPED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tracking_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ward` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKtu4d98vdobypyhhq3d7am3qo` (`order_id`),
  UNIQUE KEY `UKn2wc92xrgvbr8gbguylcxk0me` (`tracking_number`),
  KEY `FK51qxi5of87oedg32evvehxr8x` (`user_id`),
  CONSTRAINT `FK51qxi5of87oedg32evvehxr8x` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK8bxet17ivvhhma7tid6k0gr8o` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shippings`
--

LOCK TABLES `shippings` WRITE;
/*!40000 ALTER TABLE `shippings` DISABLE KEYS */;
/*!40000 ALTER TABLE `shippings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sizes`
--

DROP TABLE IF EXISTS `sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sizes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKrmd719hqv99q34v9yfelrkq3v` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sizes`
--

LOCK TABLES `sizes` WRITE;
/*!40000 ALTER TABLE `sizes` DISABLE KEYS */;
INSERT INTO `sizes` VALUES (1,'35'),(2,'36'),(3,'37'),(4,'38'),(5,'39'),(6,'40'),(7,'41'),(8,'42'),(9,'43');
/*!40000 ALTER TABLE `sizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FKh8ciramu9cc9q3qcqiv4ue8a6` (`role_id`),
  CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1),(2,2),(3,2);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ACTIVE','BLOCKED','INACTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UK9q63snka3mdh91as4io72espi` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-05-22 15:14:59.633040','2026-05-22 15:14:59.633040',NULL,'admin@admin.com','System Admin','$2a$10$GjEr7RKZEu.6CTwWoxYAhukOHkGy0RQWun8iZg4cKMislQ1ROV8ya','0123456789','ACTIVE'),(2,'2026-05-22 15:14:59.745008','2026-05-22 15:14:59.745008','https://api.dicebear.com/8.x/initials/svg?seed=Nguyen%20Van%20An','staff.an@local.com','Nguyen Van An','$2a$10$Fh1GIyM7XS38jPhBvTmHaO90j.QyHOrGMnPWbq0O9BtQQWhEOq/ha','0901000001','ACTIVE'),(3,'2026-05-22 15:14:59.847921','2026-05-22 15:14:59.847921','https://api.dicebear.com/8.x/initials/svg?seed=Tran%20Thi%20Binh','staff.binh@local.com','Tran Thi Binh','$2a$10$dYYZaAivru2HJPg12UHeJ.5msQ/x1UNuHyJCW.gSQMor40WKLfMaS','0901000002','ACTIVE');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variants`
--

DROP TABLE IF EXISTS `variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variants` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `additional_price` decimal(12,2) NOT NULL,
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ACTIVE','DISCONTINUED','OUT_OF_STOCK') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock_quantity` int NOT NULL,
  `product_id` bigint NOT NULL,
  `size_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKqfjb9fugd1e4piqd5119135yk` (`sku`),
  KEY `FK95bued017vcya4rf4s7n31ew4` (`product_id`),
  KEY `FKpj3hv14tks24dgi529b1t9k8f` (`size_id`),
  CONSTRAINT `FK95bued017vcya4rf4s7n31ew4` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKpj3hv14tks24dgi529b1t9k8f` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variants`
--

LOCK TABLES `variants` WRITE;
/*!40000 ALTER TABLE `variants` DISABLE KEYS */;
INSERT INTO `variants` VALUES (1,'2026-05-22 15:15:00.081654','2026-05-22 15:15:00.081654',0.00,'Black/White','https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-1-0','ACTIVE',10,1,2),(2,'2026-05-22 15:15:00.091015','2026-05-22 15:15:00.091015',0.00,'Black/White','https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-2-0','ACTIVE',10,2,3),(3,'2026-05-22 15:15:00.101835','2026-05-22 15:15:00.101835',0.00,'Black/White','https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-3-0','ACTIVE',10,3,4),(4,'2026-05-22 15:15:00.112446','2026-05-22 15:15:00.112446',0.00,'Black/White','https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-4-0','ACTIVE',10,4,5),(5,'2026-05-22 15:15:00.124593','2026-05-22 15:15:00.124593',0.00,'Black/White','https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-5-0','ACTIVE',10,5,6),(6,'2026-05-22 15:15:00.134746','2026-05-22 15:15:00.134746',0.00,'Black/White','https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-6-0','ACTIVE',10,6,7),(7,'2026-05-22 15:15:00.146751','2026-05-22 15:15:00.146751',0.00,'Black/White','https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-7-0','ACTIVE',10,7,8),(8,'2026-05-22 15:15:00.160740','2026-05-22 15:15:00.160740',0.00,'Black/White','https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-8-0','ACTIVE',10,8,9),(9,'2026-05-22 15:15:00.168743','2026-05-22 15:15:00.168743',0.00,'Black/White','https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-9-0','ACTIVE',10,9,1),(10,'2026-05-22 15:15:00.180342','2026-05-22 15:15:00.180342',0.00,'Black/White','https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-10-0','ACTIVE',10,10,2),(11,'2026-05-22 15:15:00.187354','2026-05-22 15:15:00.187354',0.00,'Black/White','https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-11-0','ACTIVE',10,11,3),(12,'2026-05-22 15:15:00.198850','2026-05-22 15:15:00.198850',0.00,'Black/White','https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-12-0','ACTIVE',10,12,4),(13,'2026-05-22 15:15:00.206836','2026-05-22 15:15:00.206836',0.00,'Black/White','https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-13-0','ACTIVE',10,13,5),(14,'2026-05-22 15:15:00.216834','2026-05-22 15:15:00.216834',0.00,'Black/White','https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-14-0','ACTIVE',10,14,6),(15,'2026-05-22 15:15:00.223063','2026-05-22 15:15:00.223063',0.00,'Black/White','https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-15-0','ACTIVE',10,15,7),(16,'2026-05-22 15:15:00.231062','2026-05-22 15:15:00.231062',0.00,'Black/White','https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-16-0','ACTIVE',10,16,8),(17,'2026-05-22 15:15:00.237047','2026-05-22 15:15:00.237047',0.00,'Black/White','https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-17-0','ACTIVE',10,17,9),(18,'2026-05-22 15:15:00.246072','2026-05-22 15:15:00.246072',0.00,'Black/White','https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-18-0','ACTIVE',10,18,1),(19,'2026-05-22 15:15:00.256053','2026-05-22 15:15:00.256053',0.00,'Black/White','https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-19-0','ACTIVE',10,19,2),(20,'2026-05-22 15:15:00.268054','2026-05-22 15:15:00.268054',0.00,'Black/White','https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-20-0','ACTIVE',10,20,3),(21,'2026-05-22 15:15:00.281138','2026-05-22 15:15:00.281138',0.00,'Black/White','https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-21-0','ACTIVE',10,21,4),(22,'2026-05-22 15:15:00.293129','2026-05-22 15:15:00.293129',0.00,'Black/White','https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-22-0','ACTIVE',10,22,5),(23,'2026-05-22 15:15:00.302054','2026-05-22 15:15:00.302054',0.00,'Black/White','https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-23-0','ACTIVE',10,23,6),(24,'2026-05-22 15:15:00.312051','2026-05-22 15:15:00.312051',0.00,'Black/White','https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-24-0','ACTIVE',10,24,7),(25,'2026-05-22 15:15:00.320356','2026-05-22 15:15:00.320356',0.00,'Black/White','https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-25-0','ACTIVE',10,25,8),(26,'2026-05-22 15:15:00.328827','2026-05-22 15:15:00.328827',0.00,'Black/White','https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-26-0','ACTIVE',10,26,9),(27,'2026-05-22 15:15:00.335832','2026-05-22 15:15:00.335832',0.00,'Black/White','https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-27-0','ACTIVE',10,27,1),(28,'2026-05-22 15:15:00.345834','2026-05-22 15:15:00.345834',0.00,'Black/White','https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-28-0','ACTIVE',10,28,2),(29,'2026-05-22 15:15:00.353819','2026-05-22 15:15:00.353819',0.00,'Black/White','https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-29-0','ACTIVE',10,29,3),(30,'2026-05-22 15:15:00.363831','2026-05-22 15:15:00.364838',0.00,'Black/White','https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60','SKU-30-0','ACTIVE',10,30,4);
/*!40000 ALTER TABLE `variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_schedules`
--

DROP TABLE IF EXISTS `work_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_schedules` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `locked_at` datetime(6) DEFAULT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `planned_end_at` datetime(6) DEFAULT NULL,
  `planned_start_at` datetime(6) DEFAULT NULL,
  `publish_status` enum('DRAFT','LOCKED','PUBLISHED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `published_at` datetime(6) DEFAULT NULL,
  `status` enum('ABSENT','PRESENT','SCHEDULED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_date` date NOT NULL,
  `shift_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKoabrlmrbqkf8ldylw47vhr925` (`user_id`,`shift_id`,`work_date`),
  KEY `FKoe9yynmgiahyihuhas36bnfwb` (`shift_id`),
  CONSTRAINT `FKj81w5rs9r89mvwhvwm6vuqiln` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKoe9yynmgiahyihuhas36bnfwb` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_schedules`
--

LOCK TABLES `work_schedules` WRITE;
/*!40000 ALTER TABLE `work_schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `work_schedules` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-22 16:20:56
