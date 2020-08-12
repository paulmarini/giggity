-- MySQL dump 10.13  Distrib 5.5.44, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: giggity
-- ------------------------------------------------------
-- Server version	5.5.44-0ubuntu0.14.04.1-log

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
-- Table structure for table `address_in_groups`
--

DROP TABLE IF EXISTS `address_in_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `address_in_groups` (
  `id` int(9) unsigned NOT NULL DEFAULT '0',
  `group_id` int(9) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`group_id`,`id`),
  KEY `group_id` (`group_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `addressbook`
--

DROP TABLE IF EXISTS `addressbook`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addressbook` (
  `id` int(9) unsigned NOT NULL AUTO_INCREMENT,
  `firstname` varchar(255) NOT NULL DEFAULT '',
  `lastname` varchar(255) NOT NULL DEFAULT '',
  `address` text NOT NULL,
  `home` text NOT NULL,
  `mobile` text NOT NULL,
  `work` text NOT NULL,
  `email` text NOT NULL,
  `email2` text NOT NULL,
  `bday` tinyint(2) NOT NULL DEFAULT '0',
  `bmonth` varchar(50) NOT NULL DEFAULT '',
  `byear` varchar(4) NOT NULL DEFAULT '',
  `address2` text NOT NULL,
  `phone2` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=103 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gigs`
--

DROP TABLE IF EXISTS `gigs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gigs` (
  `gig_id` int(11) NOT NULL AUTO_INCREMENT,
  `google_calendar_id` varchar(200) DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `band_start` time DEFAULT NULL,
  `band_end` time DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `who` varchar(100) DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `details` varchar(5000) DEFAULT NULL,
  `tactical` varchar(45) DEFAULT NULL,
  `public_description` varchar(1000) DEFAULT NULL,
  `approved` tinyint(4) NOT NULL DEFAULT '0',
  `musical` varchar(45) DEFAULT NULL,
  `notes` varchar(5000) DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT '0',
  `colors` varchar(45) DEFAULT NULL,
  `meet_time` time DEFAULT NULL,
  `google_public_calendar_id` varchar(100) DEFAULT NULL,
  `type` varchar(15) NOT NULL DEFAULT 'gig',
  `url` varchar(400) DEFAULT NULL,
  `setlist` text,
  PRIMARY KEY (`gig_id`),
  UNIQUE KEY `gig_id_UNIQUE` (`gig_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1255 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gigs_availability`
--

DROP TABLE IF EXISTS `gigs_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gigs_availability` (
  `gig_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `available` varchar(10) DEFAULT NULL,
  `concerns` varchar(500) DEFAULT NULL,
  `other` varchar(500) DEFAULT NULL,
  `comments` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`gig_id`,`member_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_list`
--

DROP TABLE IF EXISTS `group_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_list` (
  `group_id` int(9) unsigned NOT NULL AUTO_INCREMENT,
  `group_name` varchar(255) NOT NULL DEFAULT '',
  `group_header` mediumtext NOT NULL,
  PRIMARY KEY (`group_id`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-08-24 15:46:57
