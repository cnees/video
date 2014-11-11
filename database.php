<?php

// The SQL to uninstall this tool
$DATABASE_UNINSTALL = array(
"drop table if exists {$CFG->dbprefix}video_comments"
);

// The SQL to create the necessary tables is the don't exist
$DATABASE_INSTALL = array(
array( "{$CFG->dbprefix}video_comments",
"CREATE TABLE `video_comments` (
  `comment` text NOT NULL,
  `videoTime` int(11) NOT NULL,
  `displayname` varchar(2048) DEFAULT NULL,
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `link_id` int(11) NOT NULL,
  `parent` int(11) unsigned DEFAULT NULL,
  `replies` int(11) unsigned DEFAULT '0',
  `reports` int(11) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`,`link_id`,`user_id`),
  KEY `video_ibfk_1` (`link_id`),
  KEY `video_ibfk_2` (`user_id`),
  KEY `parent` (`parent`),
  KEY `parent_2` (`parent`),
  CONSTRAINT `video_comments_ibfk_1` FOREIGN KEY (`parent`) REFERENCES `video_comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `video_ibfk_1` FOREIGN KEY (`link_id`) REFERENCES `lti_link` (`link_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `video_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `lti_user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8;"),

array( "{$CFG->dbprefix}video_bookmarks",
"CREATE TABLE `video_bookmarks` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `videoTime` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `link_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`videoTime`,`user_id`,`link_id`),
  KEY `video_bookmarks_ibfk_1` (`link_id`),
  KEY `video_bookmarks_ibfk_2` (`user_id`),
  CONSTRAINT `video_bookmarks_ibfk_1` FOREIGN KEY (`link_id`) REFERENCES `lti_link` (`link_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `video_bookmarks_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `lti_user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8;"),

array( "{$CFG->dbprefix}video_views",
"CREATE TABLE `video_views` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `videoTime` int(11) NOT NULL,
  `views` int(11) unsigned DEFAULT 0,
  `link_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`videoTime`,`link_id`),
  KEY `video_views_ibfk_1` (`link_id`),
  CONSTRAINT `video_views_ibfk_1` FOREIGN KEY (`link_id`) REFERENCES `lti_link` (`link_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8;"),

array( "{$CFG->dbprefix}video_views_by_student",
"CREATE TABLE `video_views_by_student` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `view_vector` varchar(300) NOT NULL,
  `link_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`link_id`),
  KEY `video_views_by_student_ibfk_1` (`link_id`),
  CONSTRAINT `video_views_by_student_ibfk_1` FOREIGN KEY (`link_id`) REFERENCES `lti_link` (`link_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `video_views_by_student_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `lti_user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;")

);