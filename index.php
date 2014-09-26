<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";

use \Tsugi\Core\Settings;
use \Tsugi\Core\LTIX;
use \Tsugi\UI\SettingsForm;

// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id'));

// Handle the inoming post
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

$assn = Settings::linkGet('video');
echo("The setting for video is: ".$assn."<br/>\n");

?>
		<div id="player"></div>
		<textarea id="comment">&nbsp;</textarea>
		
		<button type="submit" id="submitComment">Submit</button>
		<div id="time"></div>
		<div id="submitStatus"></div>
		<div id="comments"></div> 
<?php
$OUTPUT->footerStart();
?>
		<script>
            // Javascript at the end to speed loading
			commentCall = "<?=addSession('comment.php')?>";
			updateCommentsCall = "<?=addSession('commentsByTime.php')?>";
			user_id = <?=$USER->id;?>;
		</script>
		<script src="video.js?v=<?=time();?>"></script>
<?php
$OUTPUT->footerEnd();
