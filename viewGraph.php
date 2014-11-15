<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";
// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id', 'link_id'));

	use \Tsugi\Core\Settings;
	if(isset($_GET['video_id'])){
		$video_id = $_GET['video_id'];
	}
	else {
		$video_id = Settings::linkGet('video');
	}
	$total_views = $PDOX->rowDie("SELECT * FROM video_views
		WHERE link_id = :LID
		AND video_id = :VID
		LIMIT 1;",
		array(
			":LID" => $LINK->id,
			":VID" => $video_id
		)
	);
	//$total_views_vector = array_map("intval", explode(",", $total_views['view_vector']));
	echo $total_views['view_vector'];
?>