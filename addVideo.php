<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";
// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id', 'link_id'));

if ( $USER->instructor ) {
	if(isset($_POST['video_id'])) {
		$row = $PDOX->queryDie("INSERT INTO
			{$CFG->dbprefix}video_ids(video_id, link_id)
			VALUES(:VID, :LID)
			ON DUPLICATE KEY UPDATE id=id;",
			array(":VID" => $_POST['video_id'], ":LID" => $LINK->id)
		);	
	}
}

?>