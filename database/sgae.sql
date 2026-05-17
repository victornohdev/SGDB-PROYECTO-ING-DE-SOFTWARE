-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sgae
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administradores`
--

DROP TABLE IF EXISTS `administradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administradores` (
  `id_admin` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `contrasena` varchar(100) NOT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `alumno_id` int DEFAULT NULL,
  `maestro_id` int DEFAULT NULL,
  `grupo_id` int DEFAULT NULL,
  PRIMARY KEY (`id_admin`),
  KEY `fk_admin_alumno` (`alumno_id`),
  KEY `fk_admin_maestro` (`maestro_id`),
  KEY `fk_admin_grupo` (`grupo_id`),
  CONSTRAINT `fk_admin_alumno` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id_alumno`),
  CONSTRAINT `fk_admin_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id_grupo`),
  CONSTRAINT `fk_admin_maestro` FOREIGN KEY (`maestro_id`) REFERENCES `maestro` (`id_maestro`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administradores`
--

LOCK TABLES `administradores` WRITE;
/*!40000 ALTER TABLE `administradores` DISABLE KEYS */;
INSERT INTO `administradores` VALUES (1,'admin','1234','activo',NULL,NULL,NULL);
/*!40000 ALTER TABLE `administradores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumnos`
--

DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumnos` (
  `id_alumno` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `contrasena` varchar(100) NOT NULL,
  `no_control` varchar(50) DEFAULT NULL,
  `grupo_id` int DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_alumno`),
  KEY `fk_alumnos_grupo` (`grupo_id`),
  CONSTRAINT `fk_alumnos_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id_grupo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumnos`
--

LOCK TABLES `alumnos` WRITE;
/*!40000 ALTER TABLE `alumnos` DISABLE KEYS */;
INSERT INTO `alumnos` VALUES (1,'juan','1234','A2025001',2,'2008-05-14','activo'),(2,'jorge','A122333','A122333',1,'2003-02-12','activo'),(3,'Diego Bernardo','A445523','A445523',2,'2002-09-21','activo'),(5,'Luis Miguel','A2333213','A2333213',2,'2003-05-14','activo');
/*!40000 ALTER TABLE `alumnos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias` (
  `id_asistencia` int NOT NULL AUTO_INCREMENT,
  `fecha` date DEFAULT NULL,
  `asistencia_registrada` varchar(50) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `alumno_id` int DEFAULT NULL,
  `grupo_id` int DEFAULT NULL,
  PRIMARY KEY (`id_asistencia`),
  KEY `fk_asistencia_grupo` (`grupo_id`),
  KEY `fk_asistencia_alumno` (`alumno_id`),
  CONSTRAINT `fk_asistencia_alumno` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_asistencia_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id_grupo`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
INSERT INTO `asistencias` VALUES (1,'2026-05-10','asistio','activo',1,1),(7,'2026-05-11','asistio','activo',1,2),(8,'2026-05-11','asistio','activo',3,2),(9,'2026-05-11','falto','activo',2,1);
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupos`
--

DROP TABLE IF EXISTS `grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupos` (
  `id_grupo` int NOT NULL AUTO_INCREMENT,
  `turno` varchar(50) DEFAULT NULL,
  `maestro_id` int DEFAULT NULL,
  `alumno_id` int DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `grado` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_grupo`),
  KEY `fk_grupos_maestro` (`maestro_id`),
  KEY `fk_grupos_alumno` (`alumno_id`),
  CONSTRAINT `fk_grupos_alumno` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id_alumno`),
  CONSTRAINT `fk_grupos_maestro` FOREIGN KEY (`maestro_id`) REFERENCES `maestro` (`id_maestro`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupos`
--

LOCK TABLES `grupos` WRITE;
/*!40000 ALTER TABLE `grupos` DISABLE KEYS */;
INSERT INTO `grupos` VALUES (1,'matutino',2,1,'C','3'),(2,'matutino',NULL,1,'A','6'),(4,'matutino',1,NULL,'B','6'),(5,'matutino',7,NULL,'C','6'),(6,'matutino',1,NULL,'A','3'),(7,'matutino',1,NULL,'B','3'),(8,'matutino',NULL,NULL,'A','2'),(9,'matutino',NULL,NULL,'B','2'),(10,'matutino',2,NULL,'C','2'),(11,'matutino',1,NULL,'A','1'),(12,'matutino',1,NULL,'B','1'),(13,'matutino',NULL,NULL,'C','1'),(14,'matutino',1,NULL,'A','4'),(15,'matutino',1,NULL,'B','4'),(16,'matutino',2,NULL,'C','4'),(17,'matutino',1,NULL,'A','5'),(18,'matutino',2,NULL,'B','5'),(19,'matutino',8,NULL,'C','5');
/*!40000 ALTER TABLE `grupos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maestro`
--

DROP TABLE IF EXISTS `maestro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maestro` (
  `id_maestro` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `contrasena` varchar(100) NOT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `grupo_id` int DEFAULT NULL,
  `usuario` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_maestro`),
  KEY `fk_maestro_grupo` (`grupo_id`),
  CONSTRAINT `fk_maestro_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id_grupo`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maestro`
--

LOCK TABLES `maestro` WRITE;
/*!40000 ALTER TABLE `maestro` DISABLE KEYS */;
INSERT INTO `maestro` VALUES (1,'carlos','1234','activo',1,'Carlos Hernandez'),(2,'ivette','1234','activo',NULL,'Ivette Garcia'),(7,'victor','1234','activo',NULL,'Victor Antonio'),(8,'luis','1234','activo',NULL,'Luis Miguel');
/*!40000 ALTER TABLE `maestro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) DEFAULT NULL,
  `contrasena` varchar(255) DEFAULT NULL,
  `rol` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','1234','maestro'),(2,'ADMIN','1234','admin');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-17 15:05:13
