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
		<link rel="stylesheet" type="style/css" href="style.css?v=<?=rand()?>">
		<link href="<?php echo($CFG->staticroot); ?>/static/bootstrap-3.1.1/css/bootstrap.min.css" rel="stylesheet">
<?php
$OUTPUT->bodyStart();
$OUTPUT->flashMessages();
if ( $USER->instructor ) {
    if ( $USER->instructor ) SettingsForm::button(true);
    SettingsForm::start(); ?>
<label for="video">
            Please select a YouTube video.<br/>
<?php
    SettingsForm::text('video');
    echo("</label>\n");
    SettingsForm::end();
}

?>
<div class="row-fluid">
	<div class="col-xs-12 col-md-6">
		<div id="player">&nbsp;</div>
		<textarea id="comment">&nbsp;</textarea>
		<button type="submit" id="submitComment">Post</button><button type="submit" id="saveNote">Save Note</button>
		<div id="submitStatus">&nbsp;</div>
	</div>
	<div class="col-xs-12 col-md-6">
		<div id="comments">&nbsp;</div> 
	</div>
</div>
<!--
<div id="column1" role="layout">
	<div id="player">&nbsp;</div>
	<textarea id="comment">&nbsp;</textarea>
	<button type="submit" id="submitComment">Post</button><button type="submit" id="saveNote">Save Note</button>
	<div id="submitStatus">&nbsp;</div>
</div>
<div id="column2" role="layout">
	<div id="comments">&nbsp;</div> 
</div>
-->
<?php
$OUTPUT->footerStart();
?>
		<script>
            // Javascript at the end to speed loading
			COMMENTCALL = "<?=addSession('comment.php')?>";
			UPDATECOMMENTCALL = "<?=addSession('commentsByTime.php')?>";
			DELETECOMMENTCALL = "<?=addSession('delete.php')?>";
			REPLIESCALL = "<?=addSession('fetchReplies.php')?>";
			VIDEO_ID = "<?=Settings::linkGet('video');?>";
			USER_ID = <?=$USER->id;?>;
		</script>
		<script src="video.js?v=<?=rand()?>"></script>
<?php
$OUTPUT->footerEnd();
