<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";
// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id', 'link_id'));

if(isset($_GET['fetch'])) { // Retrieve bookmarks from database
	$bookmarks = $PDOX->allRowsDie("SELECT videoTime
		FROM {$CFG->dbprefix}video_bookmarks
		WHERE user_id = :UID
		AND link_id = :LID
		ORDER BY videoTime ASC",
		array(
			":UID" => $USER->id,
			":LID" => $LINK->id
		)
	);
	echo json_encode($bookmarks);
}
else if(isset($_POST['bookmark'])) { // Add new bookmark
	$row = $PDOX->queryDie("INSERT INTO
		{$CFG->dbprefix}video_bookmarks(videoTime, user_id, link_id)
		VALUES(:TI, :UID, :LID)",
		array(
			":TI" => $_POST['bookmark'],
			":UID" => $USER->id,
			":LID" => $LINK->id
		)
	);
}
else if(isset($_POST['forget'])) { // Remove old bookmark
	$row = $PDOX->queryDie("DELETE FROM
		{$CFG->dbprefix}video_bookmarks
		WHERE videoTime = :TI
		AND user_id = :UID
		AND link_id = :LID
		LIMIT 1",
		array(
			":TI" => $_POST['forget'],
			":UID" => $USER->id,
			":LID" => $LINK->id
		)
	);
}
?>