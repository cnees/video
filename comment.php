<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";

// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id', 'user_displayname'));

$comment = htmlspecialchars($_POST['comment']);
if(isset($_POST['update'])) {
	$row = $PDOX->queryDie("UPDATE {$CFG->dbprefix}video_comments SET comment=:CO WHERE user_id=:UID AND id=:ID", array(":CO" => $comment, ":UID" => $USER->id, ":ID" => $_POST['update']));	
}
else {
	$time = htmlspecialchars($_POST['time']);
	$row = $PDOX->queryDie("INSERT INTO {$CFG->dbprefix}video_comments(comment, videoTime, displayname, user_id) VALUES(:CO, :TI, :DN, :ID)", array(":CO" => $comment, ":TI" => $time, ":DN" => $USER->displayname, ":ID" => $USER->id));
}
?>