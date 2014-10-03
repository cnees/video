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
		<link rel="stylesheet" type="style/css" href="style.css?v=<?=time();?>">
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
		<div id="player">&nbsp;</div>
		<textarea id="comment">&nbsp;</textarea>
		<button type="submit" id="submitComment">Submit</button>
		<div id="time">&nbsp;</div>
		<div id="submitStatus">&nbsp;</div>
		<div id="comments">&nbsp;</div> 
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
		<script src="video.js?v=<?=time();?>"></script>
<?php
$OUTPUT->footerEnd();
