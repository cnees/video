<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";
$LTI = \Tsugi\Core\LTIX::requireData(array('link_id', 'user_id'));

use \Tsugi\Core\Settings;
$video_id = Settings::linkGet('video');

$parentID = -1;
if(isset($_GET['parentMessageID'])) $parentID = $_GET['parentMessageID'];
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