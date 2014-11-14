<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";
// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id', 'user_displayname', 'link_id'));

$note = 0;
if(isset($_POST['note'])) {
	$note = 1;
	$comment = htmlspecialchars($_POST['note']);
}
else $comment = htmlspecialchars($_POST['comment']);

// UPDATE EXISTING COMMENT
if(isset($_POST['update'])) {
	$row = $PDOX->queryDie("UPDATE
		{$CFG->dbprefix}video_comments
		SET comment=:CO
		WHERE user_id=:UID
		AND id=:ID
		LIMIT 1",
		array(":CO" => $comment,
		":UID" => $USER->id,
		":ID" => $_POST['update']));	
}
else if(isset($_POST['replyTo'])) {
	// REPLY TO EXISTING COMMENT
	$time = htmlspecialchars($_POST['time']);
	// INCREMENT PARENT COMMENT'S REPLY COUNT
	$row = $PDOX->queryDie("UPDATE
		{$CFG->dbprefix}video_comments
		SET replies = replies + 1
		WHERE id = :ID
		LIMIT 1",
		array(":ID" => $_POST['replyTo'])
	);
	// ADD CHILD COMMENT
	if($row->rowCount() == 1) {
		$row = $PDOX->queryDie("INSERT INTO
			{$CFG->dbprefix}video_comments(comment, videoTime, displayname, user_id, link_id, parent, private)
			VALUES(:CO, :TI, :DN, :ID, :LID, :PA, 0)",
			array(":CO" => $comment,
			":TI" => $time,
			":DN" => $USER->displayname,
			":ID" => $USER->id,
			":LID" => $LINK->id,
			":PA" => $_POST['replyTo'])
		);
	}
}
else {
	// ADD NEW COMMENT
	$time = htmlspecialchars($_POST['time']);
	$row = $PDOX->queryDie("INSERT INTO
		{$CFG->dbprefix}video_comments(comment, videoTime, displayname, user_id, link_id, private)
		VALUES(:CO, :TI, :DN, :ID, :LID, :P)", array(":CO" => $comment,
		":TI" => $time,
		":DN" => $USER->displayname,
		":ID" => $USER->id,
		":LID" => $LINK->id,
		":P" => $note)
	);
}
?>