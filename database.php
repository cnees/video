<?php

// The SQL to uninstall this tool
$DATABASE_UNINSTALL = array(
"drop table if exists {$CFG->dbprefix}video_comments"
);

// The SQL to create the necessary tables is the don't exist
$DATABASE_INSTALL = array(
array( "{$CFG->dbprefix}video_comments",
"CREATE TABLE `{$CFG->dbprefix}video_comments` (
  `comment` text NOT NULL,
  `videoTime` int(11) NOT NULL,
  `displayname` varchar(2048) DEFAULT NULL,
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `link_id` INTEGER NOT NULL,
  CONSTRAINT `{$CFG->dbprefix}video_ibfk_1`
        FOREIGN KEY (`link_id`)
        REFERENCES `{$CFG->dbprefix}lti_link` (`link_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT `{$CFG->dbprefix}video_ibfk_2`
      FOREIGN KEY (`user_id`)
      REFERENCES `{$CFG->dbprefix}lti_user` (`user_id`)
      ON DELETE CASCADE ON UPDATE CASCADE,

  UNIQUE(id, link_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;")
);