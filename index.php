<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";

// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id'));
?>
<html>
	<head>
		<link rel="stylesheet" type="style/css" href="style.css?v=6">
		<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
		<script>
			commentCall = "<?=addSession('comment.php')?>";
			updateCommentsCall = "<?=addSession('commentsByTime.php')?>";
			user_id = <?=$USER->id;?>;
		</script>
		<script src="video.js"></script>
	</head>
	<body>
		<div id="player"></div>
		<textarea id="comment">&nbsp;</textarea>
		
		<button type="submit" id="submitComment">Submit</button>
		<div id="time"></div>
		<div id="submitStatus"></div>
		<div id="comments"></div> 
	</body>
</html>	