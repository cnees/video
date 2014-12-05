<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";

use \Tsugi\Core\Settings;
use \Tsugi\Core\LTIX;
use \Tsugi\UI\SettingsForm;

// Sanity checks
$LTI = \Tsugi\Core\LTIX::requireData(array('user_id'));

// Handle the incoming 2st
if ( SettingsForm::handleSettingsPost() ) {
    header('Location: '.addSession('index.php') ) ;
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
	require_once "instructor.php";
}

?>
<div class="row-fluid">
	<div class="col-xs-12 col-md-12">
		<div id="playerwrapper">
			<div id="player">&nbsp;</div>
		</div>
		<br>
		
		
		<div style="width:100%;text-align:center;">
			<button style="width:25%;box-style:border-box;margin:0px;" id="commentsTab"><span class="glyphicon btn-lg glyphicon-comment"></span></button><button
					style="width:25%;box-style:border-box;margin:0px;" id="bookmarksTab"><span class="glyphicon btn-lg glyphicon-bookmark"></span></button><button
					style="width:25%;box-style:border-box;margin:0px;" id="cutsTab"><span class="glyphicon btn-lg glyphicon-film"></span></button><button
					style="width:25%;box-style:border-box;margin:0px;" id="graphTab"><span class="glyphicon btn-lg glyphicon-signal"></span></button>
		</div>

		<div id="bookmarksSection">
			
		</div>

		<div id="graphSection">
			<!--<p><button type="submit" id="sendData">Send View stats</button></p>-->
			
		</div>


		<br>
		
		<br>
		<button type="submit" id="toggleGraph"><span class="glyphicon glyphicon-signal"></span></button>
		<button type="submit" id="bookmark"><span class="glyphicon glyphicon-bookmark"></span> Bookmark<!--<span id="clock">00:00</span>--></button>
		<span id="bookmarks">&nbsp;</span>
		<p>
		<p><button type="submit" id="playCut">Quick Review</button></p>
		<div id="chartWrapper" style="display:none"><div id="chart_div" style="width: 900px; height: 500px;">Loading View Stats</div></div>
		<textarea placeholder="Leave a response" id="comment"></textarea>
		</p>
		<button type="submit" id="submitComment">Save as Comment</button>
		<button type="submit" id="saveNote" alt="Notes are not visible to classmates">Save as Note</button>
		<div class="infobox">
			<span class="glyphicon glyphicon-question-sign info" style="color:#ccc;"></span>
			<span class="info">Comments are visible to anyone logged in. Your notes are only visible to you and your class administrators.</span>
		</div>
	</div>
	<div class="col-xs-12 col-md-12">
		<div id="commentsSection">
			<span style="font-size:18px;">Replies</span>
			<span id="searchButton" class="glyphicon glyphicon-search" style="float:right;margin:5px;font-size:12px"></span><input id="search" placeholder="Search Replies" class="form-control" style="width:200px;display:inline;padding:5px;float:right;height:25px;">
			<div id="searchResults" style="display:none;"></div>
		</div>
		<div id="comments">&nbsp;</div> 
	</div>
</div>






<?php
$OUTPUT->footerStart();
?>
		<script type="text/javascript" src="https://www.google.com/jsapi"></script>
		<script src="jquery-ui-1.11.2.custom/jquery-ui.min.js?v=<?=rand()?>"></script>
		<script>

            // Javascript at the end to speed loading
			COMMENTCALL = "<?=addSession('comment.php')?>";
			UPDATECOMMENTCALL = "<?=addSession('updateComments.php')?>";
			DELETECOMMENTCALL = "<?=addSession('delete.php')?>";
			REPLIESCALL = "<?=addSession('fetchReplies.php')?>";
			BOOKMARKCALL = "<?=addSession('bookmark.php')?>";
			VIEWSCALL = "<?=addSession('views.php')?>";
			GRAPHCALL = "<?=addSession('viewGraph.php')?>";
			ADDVIDEOCALL = "<?=addSession('addVideo.php')?>";
			REPORTCALL = "<?=addSession('report.php')?>";
			VIDEO_ID = "<?=Settings::linkGet('video');?>";
			USER_ID = <?=$USER->id;?>;
		</script>
		<script src="video.js?v=<?=rand()?>"></script>

<?php
$OUTPUT->footerEnd();
