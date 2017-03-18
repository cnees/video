<?php
require_once "../config.php";

$LTI = \Tsugi\Core\LTIX::requireData(array('link_id', 'user_id'));

use \Tsugi\Core\Settings;
$video_id = Settings::linkGet('video');

$parentID = -1;
if(isset($_GET['search'])) {
	$comments = $PDOX->allRowsDie("SELECT * FROM {$CFG->dbprefix}video_comments
		WHERE link_id = :LID
		AND video_id = :VID
		AND (NOT private
			OR user_id = :UID)
		AND (NOT reports)
		AND MATCH(comment) AGAINST(:Q)
		LIMIT 100",	
		array(
			":LID" => $LINK->id,
			":VID" => $video_id,
			":UID" => $USER->id,
			":Q" => $_GET['search']
		)
	);
	echo json_encode($comments);
	return;
}
else if(isset($_GET['parentMessageID'])) $parentID = $_GET['parentMessageID'];
$comments;
if($parentID == -1) { // Load comments without parents (comments that are not replies)
	$comments = $PDOX->allRowsDie("SELECT * FROM {$CFG->dbprefix}video_comments
		WHERE parent IS NULL
		AND link_id = :LID
		AND video_id = :VID
		AND (
			NOT private
			OR user_id = :UID
		)
		AND (
			NOT reports
		)
		ORDER BY videoTime ASC LIMIT 100",
		array(":UID" => $USER->id, ":LID" => $LINK->id, ":VID" => $video_id, ":UID" => $USER->id)
	);
}
else { // Load replies to parent
	$comments = $PDOX->allRowsDie("SELECT * FROM {$CFG->dbprefix}video_comments
		WHERE parent = :PID
		AND link_id = :LID
		AND (
			NOT private
			OR user_id = :UID
		)
		AND (
			NOT reports
		)
		ORDER BY videoTime ASC LIMIT 100",
		array(":LID" => $LINK->id, ":PID" => $parentID, ":UID" => $USER->id)
	);
}
// To do: Make it possible to load more than 100 comments
echo json_encode($comments);
?>
