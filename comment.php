<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";
//$LINK->id;
// see attend database.php
// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id', 'user_displayname', 'link_id'));

$comment = htmlspecialchars($_POST['comment']);
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
	$time = htmlspecialchars($_POST['time']);
	$row = $PDOX->queryDie("UPDATE
		{$CFG->dbprefix}video_comments
		SET replies = replies + 1
		WHERE id = :ID
		LIMIT 1",
		array(":ID" => $_POST['replyTo'])
	);
	if($row->rowCount() == 1) {
		$row = $PDOX->queryDie("INSERT INTO
			{$CFG->dbprefix}video_comments(comment, videoTime, displayname, user_id, link_id, parent)
			VALUES(:CO, :TI, :DN, :ID, :LID, :PA)",
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
	$time = htmlspecialchars($_POST['time']);
	$row = $PDOX->queryDie("INSERT INTO
		{$CFG->dbprefix}video_comments(comment, videoTime, displayname, user_id, link_id)
		VALUES(:CO, :TI, :DN, :ID, :LID)", array(":CO" => $comment,
		":TI" => $time,
		":DN" => $USER->displayname,
		":ID" => $USER->id,
		":LID" => $LINK->id)
	);
}
?>