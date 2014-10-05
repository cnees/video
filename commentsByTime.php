<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";
$LTI = \Tsugi\Core\LTIX::requireData(array('link_id'));


if(!isset($_GET['time'])) die();
$time = $_GET['time'];
$parentID = -1;
if(isset($_GET['parentMessageID'])) $parentID = $_GET['parentMessageID'];
$comments;
if($parentID == -1) { // Load comments without parents (comments that are not replies)
	$comments = $PDOX->allRowsDie("SELECT * FROM {$CFG->dbprefix}video_comments
		WHERE parent IS NULL
		AND link_id = :LID
		ORDER BY videoTime DESC LIMIT 100",
		array(":LID" => $LINK->id)
	);
}
else { // Load replies to parent
	$comments = $PDOX->allRowsDie("SELECT * FROM {$CFG->dbprefix}video_comments
		WHERE parent = :PID
		AND link_id = :LID
		ORDER BY videoTime DESC LIMIT 100",
		array(":LID" => $LINK->id, ":PID" => $parentID)
	);
}
// To do: Make it possible to load more than 100 comments
echo json_encode($comments);
?>