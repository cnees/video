<?php

// The SQL to uninstall this tool
$DATABASE_UNINSTALL = array(
  "drop table if exists {$CFG->dbprefix}video_comments;",
  "drop table if exists {$CFG->dbprefix}video_bookmarks;",
  "drop table if exists {$CFG->dbprefix}video_views;",
  "drop table if exists {$CFG->dbprefix}video_views_by_student;",
  "drop table if exists {$CFG->dbprefix}video_ids;"
);

// The SQL to create the necessary tables if they don't exist

$DATABASE_INSTALL = array(

  array( "{$CFG->dbprefix}video_ids",
  "CREATE TABLE `{$CFG->dbprefix}video_ids` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `video_id` varchar(11) NOT NULL DEFAULT '',
    `link_id` int(11) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `{$CFG->dbprefix}video_key` (`video_id`,`id`),
    UNIQUE KEY `{$CFG->dbprefix}uniqe_video` (`link_id`,`video_id`),
    KEY `id` (`id`,`video_id`),
    CONSTRAINT `{$CFG->dbprefix}video_ids_ibfk_1` FOREIGN KEY (`link_id`) 
        REFERENCES `{$CFG->dbprefix}lti_link` (`link_id`) ON DELETE CASCADE
  ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
  "),

  array( "{$CFG->dbprefix}video_comments",
  "CREATE TABLE `{$CFG->dbprefix}video_comments` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `video_id` varchar(11) NOT NULL DEFAULT '',
    `link_id` int(11) NOT NULL,
    `videoTime` int(11) NOT NULL,
    `comment` text NOT NULL,
    `parent` int(11) unsigned DEFAULT NULL,
    `private` tinyint(1) DEFAULT NULL,
    `replies` int(11) unsigned DEFAULT '0',
    `reports` int(11) DEFAULT '0',
    `user_id` int(11) NOT NULL,
    `displayname` varchar(2048) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `{$CFG->dbprefix}video_ibfk_1` (`link_id`),
    KEY `{$CFG->dbprefix}video_ibfk_2` (`user_id`),
    KEY `{$CFG->dbprefix}video_comments_ibfk_1` (`parent`),
    KEY `{$CFG->dbprefix}video_key` (`link_id`,`video_id`),
    CONSTRAINT `{$CFG->dbprefix}video_comments_ibfk_1` FOREIGN KEY (`parent`) 
        REFERENCES `{$CFG->dbprefix}video_comments` (`id`) ON DELETE CASCADE,
    CONSTRAINT `{$CFG->dbprefix}video_ibfk_2` FOREIGN KEY (`user_id`) 
        REFERENCES `{$CFG->dbprefix}lti_user` (`user_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `{$CFG->dbprefix}video_key` FOREIGN KEY (`link_id`, `video_id`) 
        REFERENCES `{$CFG->dbprefix}video_ids` (`link_id`, `video_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB AUTO_INCREMENT=285 DEFAULT CHARSET=utf8;
  "),

  array( "{$CFG->dbprefix}video_comments",
  "ALTER TABLE `{$CFG->dbprefix}video_comments` ADD FULLTEXT(`comment`);
  "),

  // This is separate from the CREATE TABLE command because it won't work in older versions of MySQL.
  // It makes the comments searchable.
  
  array( "{$CFG->dbprefix}video_bookmarks",
  "CREATE TABLE `{$CFG->dbprefix}video_bookmarks` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `video_id` varchar(11) NOT NULL DEFAULT '',
    `link_id` int(11) NOT NULL,
    `videoTime` int(11) NOT NULL,
    `user_id` int(11) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `videoTime` (`video_id`,`link_id`,`videoTime`,`user_id`),
    KEY `{$CFG->dbprefix}video_bookmarks_ibfk_1` (`link_id`),
    KEY `{$CFG->dbprefix}video_bookmarks_ibfk_2` (`user_id`),
    KEY `{$CFG->dbprefix}video_bookmark_key` (`link_id`,`video_id`),
    CONSTRAINT `{$CFG->dbprefix}video_bookmarks_ibfk_2` FOREIGN KEY (`user_id`) 
        REFERENCES `{$CFG->dbprefix}lti_user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `{$CFG->dbprefix}video_bookmark_key` FOREIGN KEY (`link_id`, `video_id`) 
        REFERENCES `{$CFG->dbprefix}video_ids` (`link_id`, `video_id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB AUTO_INCREMENT=232 DEFAULT CHARSET=utf8;
  "),

  array( "{$CFG->dbprefix}video_views",
  "CREATE TABLE `{$CFG->dbprefix}video_views` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `video_id` varchar(11) NOT NULL DEFAULT '',
    `link_id` int(11) NOT NULL,
    `view_vector` varchar(300) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `{$CFG->dbprefix}video_view_key` (`video_id`,`link_id`),
    KEY `{$CFG->dbprefix}video_views_ibfk_1` (`link_id`),
    KEY `{$CFG->dbprefix}video_view_key_1` (`link_id`,`video_id`),
    CONSTRAINT `{$CFG->dbprefix}video_view_key_1` FOREIGN KEY (`link_id`, `video_id`) 
        REFERENCES `{$CFG->dbprefix}video_ids` (`link_id`, `video_id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB AUTO_INCREMENT=2222 DEFAULT CHARSET=utf8;
  "),

  array( "{$CFG->dbprefix}video_views_by_student",
  "CREATE TABLE `{$CFG->dbprefix}video_views_by_student` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `video_id` varchar(11) NOT NULL DEFAULT '',
    `link_id` int(11) NOT NULL,
    `view_vector` varchar(300) NOT NULL,
    `user_id` int(11) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_id` (`user_id`,`link_id`,`video_id`),
    KEY `{$CFG->dbprefix}video_views_by_student_ibfk_1` (`link_id`),
    KEY `{$CFG->dbprefix}video_views_by_student_key` (`link_id`,`video_id`),
    CONSTRAINT `{$CFG->dbprefix}video_views_by_student_ibfk_2` FOREIGN KEY (`user_id`) 
        REFERENCES `{$CFG->dbprefix}lti_user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `{$CFG->dbprefix}video_views_by_student_key` FOREIGN KEY (`link_id`, `video_id`) 
        REFERENCES `{$CFG->dbprefix}video_ids` (`link_id`, `video_id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB AUTO_INCREMENT=2248 DEFAULT CHARSET=utf8;
  ")

);
