<?php
require_once "../config.php";

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
			<button style="width:25%;box-style:border-box;margin:0px;" id="commentsTab"><span class="glyphicon btn-lg glyphicon-comment"></span><br><span>comments</span></button><button
					style="width:25%;box-style:border-box;margin:0px;" id="bookmarksTab"><span class="glyphicon btn-lg glyphicon-bookmark"></span><br><span>bookmarks</span></button><button
					style="width:25%;box-style:border-box;margin:0px;" id="cutsTab"><span class="glyphicon btn-lg glyphicon-film"></span><br><span>remixes</span></button><button
					style="width:25%;box-style:border-box;margin:0px;" id="graphTab"><span class="glyphicon btn-lg glyphicon-signal"></span><br><span>views</span></button>
		</div>
		<br>
		
	</div>
	<div class="col-xs-12 col-md-12">
		<div id="commentsSection">
			<textarea placeholder="Leave a response" id="comment"></textarea>
			<br>
			<button type="submit" id="submitComment">Save as Comment</button>
			<button type="submit" id="saveNote" alt="Notes are not visible to classmates">Save as Note</button>
			<div class="infobox">
				<span class="glyphicon glyphicon-question-sign info" style="color:#ccc;"></span>
				<span class="info">Comments are visible to anyone logged in. Your notes are only visible to you and your class administrators.</span>
			</div>
			<br><br>
			<div id="commentsHeader">
				<span style="font-size:18px;">Replies</span>
				<span id="searchButton" class="glyphicon glyphicon-search" style="float:right;margin:5px;font-size:12px"></span>
				<input id="search" placeholder="Search Replies" class="form-control" style="width:200px;display:inline;padding:5px;float:right;height:25px;">
				<div id="searchResults" style="display:none;"></div>
			</div>
			<div id="comments">&nbsp;</div> 
		</div>

		<div id="bookmarksSection">
			<button type="submit" id="bookmark"><span class="glyphicon glyphicon-bookmark"></span> Bookmark<!--<span id="clock">00:00</span>--></button>
			<span id="bookmarks">&nbsp;</span>
		</div>

		<div id="cutsSection">
			<ul>
				<li>Select a clip from the video with the slider</li>
				<li>Use the + to add more sliders</li>
				<li>Press "Play" to watch the clips from top to bottom</li>
				<li>Save and share features coming soon</li>
			</ul>
			</p>
			<p><button type="submit" id="playCuts">Play</button></p>
			<div id="cuts"></div>
		</div>

		<div id="graphSection">
			<!--<p><button type="submit" id="sendData">Send View stats</button></p>-->
			View stats for 
			<?php
				require_once "listUsers.php";
			?>
			<div id="chartWrapper"><div id="chart_div" style="width: 900px; height: 500px;">Loading View Stats</div></div>
		</div>
			
	</div>
</div>






<?php
$OUTPUT->footerStart();
?>
		<script type="text/javascript" src="https://www.google.com/jsapi"></script>
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
