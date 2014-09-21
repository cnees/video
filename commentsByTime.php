<?
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";

if(!isset($_GET['time'])) die();
$time = $_GET['time'];
$comments = $PDOX->allRowsDie("SELECT * FROM {$CFG->dbprefix}video_comments ORDER BY videoTime DESC LIMIT 100");
// To do: Make it possible to load more than 100 comments
echo json_encode($comments);
/*
foreach($comments as $comment) {
	echo "<div class='comment'>";
	echo htmlspecialchars($comment['comment']);
	echo "<a class='edit'>Edit</a>";
	echo "</div>\n";
}*/

?>