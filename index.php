<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";

use \Tsugi\Core\Settings;
use \Tsugi\Core\LTIX;
use \Tsugi\UI\SettingsForm;

// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id'));

// Handle the incoming post
if ( SettingsForm::handleSettingsPost() ) {
    header( 'Location: '.addSession('index.php') ) ;
    return;
}

// Begin the view
$OUTPUT->header();
?>
		<link href="style.css?v=<?=rand()?>" rel="stylesheet">
		<link href="<?php echo($CFG->staticroot); ?>/static/bootstrap-3.1.1/css/bootstrap.min.css" rel="stylesheet">
<?php
$OUTPUT->bodyStart();
$OUTPUT->flashMessages();
if ( $USER->instructor ) {
	echo "<p style='text-align:right;'>";
    SettingsForm::button(false);
    echo "</p>";
    SettingsForm::start();
?>
<label for="video">
            Please select a YouTube video.<br/>
<?php
    SettingsForm::text('video');
    echo("</label>\n");
    SettingsForm::end();
    //require_once "reports.php";
}

?>
<div class="row-fluid">
	<div class="col-xs-12 col-md-12">
		<div id="playerwrapper">
			<div id="player">&nbsp;</div>
		</div>
		<br>
		<!--<p><button type="submit" id="sendData">Send View stats</button></p>-->
		<button type="submit" id="bookmark"><span class="glyphicon glyphicon-bookmark"></span> Bookmark <span id="clock">00:00</span></button>
		<span id="bookmarks">&nbsp;</span>
		<p>
		<!--<p><button type="submit" id="playCut">Review Bookmarks</button></p>-->
		<textarea placeholder="Leave a response" id="comment"></textarea>
		</p>
		<button type="submit" id="submitComment">Save as Comment</button>
		<button type="submit" id="saveNote" alt="Notes are not visible to classmates">Save as Note</button>
		<div class="infobox">
			<span class="glyphicon glyphicon-question-sign info" style="color:#ccc;"></span>
			<span class="info">Comments are visible to anyone logged in. Your notes are only visible to you and your class administrators.</span>
		</div>
		<div id="submitStatus">&nbsp;</div>
	</div>
	<div class="col-xs-12 col-md-12">
		<div id="commentsSection">Replies</div>
		<div id="comments">&nbsp;</div> 
	</div>
</div>
<?php
$OUTPUT->footerStart();
?>
		<script>
            // Javascript at the end to speed loading
			COMMENTCALL = "<?=addSession('comment.php')?>";
			UPDATECOMMENTCALL = "<?=addSession('updateComments.php')?>";
			DELETECOMMENTCALL = "<?=addSession('delete.php')?>";
			REPLIESCALL = "<?=addSession('fetchReplies.php')?>";
			BOOKMARKCALL = "<?=addSession('bookmark.php')?>";
			VIEWSCALL = "<?=addSession('views.php')?>";
			REPORTCALL = "<?=addSession('report.php')?>";
			VIDEO_ID = "<?=Settings::linkGet('video');?>";
			USER_ID = <?=$USER->id;?>;
		</script>
		<script src="video.js?v=<?=rand()?>"></script>
<?php
$OUTPUT->footerEnd();
