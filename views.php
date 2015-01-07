<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";
// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id', 'link_id'));

use \Tsugi\Core\Settings;
$video_id = Settings::linkGet('video');

$input_vector = $_POST['vector'];

$user_views = $PDOX->rowDie("SELECT * FROM {$CFG->dbprefix}video_views_by_student
	WHERE user_id = :UID
	AND link_id = :LID
	AND video_id = :VID
	LIMIT 1;",
	array(
		":UID" => $USER->id,
		":LID" => $LINK->id,
		":VID" => $video_id
	)
);

$total_views = $PDOX->rowDie("SELECT * FROM {$CFG->dbprefix}video_views
	WHERE link_id = :LID
	AND video_id = :VID
	LIMIT 1;",
	array(
		":LID" => $LINK->id,
		":VID" => $video_id
	)
);

$user_views_vector = array_map("intval", explode(",", $user_views['view_vector']));
$total_views_vector = array_map("intval", explode(",", $total_views['view_vector']));

$add_vector = array_map("intval", explode(",", $input_vector));

$user_views_vector = array_pad($user_views_vector, count($add_vector), 0);
$total_views_vector = array_pad($total_views_vector, count($add_vector), 0);


if(count($user_views_vector) > 1) {
	foreach ($add_vector as $i=>$i_val) {
		$user_views_vector[$i] = $user_views_vector[$i] + $add_vector[$i];
		$total_views_vector[$i] = $total_views_vector[$i] + $add_vector[$i];
	}
}

$PDOX->queryDie("INSERT INTO {$CFG->dbprefix}video_views_by_student(user_id, view_vector, link_id, video_id)
	VALUES(:UID, :VEC, :LID, :VID)
	ON DUPLICATE KEY
	UPDATE view_vector=:VEC",
	array(
		":UID" => $USER->id,
		":VEC" => implode(",",$user_views_vector),
		":LID" => $LINK->id,
		":VID" => $video_id
	)
);

$PDOX->queryDie("INSERT INTO {$CFG->dbprefix}video_views(view_vector, link_id, video_id)
	VALUES(:VEC, :LID, :VID)
	ON DUPLICATE KEY
	UPDATE view_vector=:VEC",
	array(
		":VEC" => implode(",",$total_views_vector),
		":LID" => $LINK->id,
		":VID" => $video_id
	)
);

?>
