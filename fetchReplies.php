<?
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";

if(!isset($_GET['parentID'])) die();
$parent = $_GET['parentID'];
$replies = $PDOX->allRowsDie("SELECT * FROM
	{$CFG->dbprefix}video_comments
	WHERE parent = :PA
	ORDER BY videoTime ASC LIMIT 10",
	array(":PA" => $parent)
);
// To do: Make it possible to load more than 10 replies
echo json_encode($replies);
?>