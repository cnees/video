<?php
require_once "../config.php";

// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id'));

// UPDATE EXISTING COMMENT
if(isset($_POST['id'])) {
	$row = $PDOX->queryDie("UPDATE
		{$CFG->dbprefix}video_comments
		SET reports=reports+1
		WHERE id=:ID
		LIMIT 1",
		array(":ID" => $_POST['id'])
	);	
}
?>
