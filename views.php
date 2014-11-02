<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";
// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id', 'link_id'));

$input_vector = $_POST['vector'];

$views = $PDOX->rowDie("SELECT * FROM video_views_by_student
	WHERE user_id = :UID
	AND link_id = :LID
	LIMIT 1;",
	array(
		":UID" => $USER->id,
		":LID" => $LINK->id
	)
);

print_r($views['view_vector']);

$views_vector = array_map("intval", explode(",", $views['view_vector']));
$add_vector = $int_array = array_map("intval", explode(",", $input_vector));

array_pad($views_vector, count($add_vector), 0);

foreach ($add_vector as $i=>$i_val) {
	$views_vector[$i] = $views_vector[$i] + $add_vector[$i];
}

$PDOX->queryDie("INSERT INTO video_views_by_student(user_id, view_vector, link_id)
	VALUES(:UID, :VEC, :LID)
	ON DUPLICATE KEY
	UPDATE view_vector=:VEC",
	array(
		":UID" => $USER->id,
		":VEC" => implode(",",$views_vector),
		":LID" => $LINK->id
	)
);


?>