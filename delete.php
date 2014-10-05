<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";

// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id'));

if(!isset($_POST['delete'])) {
	die();
}
$PDOX->queryDie("DELETE FROM {$CFG->dbprefix}video_comments WHERE user_id=:UID AND id=:ID LIMIT 1", array(":UID" => $USER->id, ":ID" => $_POST['delete']));
?>