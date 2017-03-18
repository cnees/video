<?php
require_once "../config.php";

// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id'));

if(!isset($_POST['delete'])) {
	die();
}
$parent = $PDOX->rowDie("SELECT parent FROM {$CFG->dbprefix}video_comments WHERE user_id=:UID AND id=:ID LIMIT 1", array(":UID" => $USER->id, ":ID" => $_POST['delete']));
if(isset($parent['parent'])) {
	$PDOX->queryDie("UPDATE {$CFG->dbprefix}video_comments
		SET replies = replies - 1
		WHERE id=:ID
		LIMIT 1",
		array(":ID" => $parent['parent']));	
}
$PDOX->queryDie("DELETE FROM {$CFG->dbprefix}video_comments WHERE user_id=:UID AND id=:ID LIMIT 1", array(":UID" => $USER->id, ":ID" => $_POST['delete']));
?>
