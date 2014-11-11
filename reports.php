<?php
	$comments = $PDOX->allRowsDie("SELECT * FROM {$CFG->dbprefix}video_comments
		WHERE reports > 0
		ORDER BY reports desc"
	);
	//echo "Count: " + count($comments);
	foreach($comments as $comment) {
		echo "<span class='reply_info'>Posted by " + $comment['displayname'];
		echo " at " + $comment['videoTime'];
		echo "</span><div class='comment'>" . $comment['comment'] . "</div>";
	}
?>