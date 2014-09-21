var comments = {
	json: null,
	lastTime: 0,
	display: function(videoTime) {
		var currentTime = player.getCurrentTime();
		if(currentTime > this.lastTime) {
			for(i = Math.floor(this.lastTime); i <= currentTime; i++) {
				$("[data-time='" + i + "']").css('display', 'block');
			}
		}
		else if(currentTime < this.lastTime) {
			for(i = Math.floor(currentTime); i <= this.lastTime; i++) {
				$("[data-time='" + i + "']").css('display', 'none');
			}
		}
		this.lastTime = currentTime;
	}
};

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		height: '400',
		width: '600',
		videoId: 'y8Kyi0WNg40',
		playerVars: {origin: 'file://localhost/', rel:0},
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerReady(event) {
	event.target.playVideo();
	getComments();
}

function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING) {
		displayInterval = setInterval(function() {comments.display();}, 200);
	}
	if (event.data === 0) {
		console.log("Done");
		clearInterval(displayInterval);
	}
}

function pauseVideo() {
	player.pauseVideo();
}

function playVideo() {
	player.playVideo();
}

function timeFormat(seconds) {
	var formatted = "";
	var minutes = 0;
	if(seconds >= 3600) {
		var hours = Math.floor(seconds/3600);
		var seconds = seconds - hours*3600;
		formatted = hours.toString() + ":"
	}
	if(seconds >= 60) {
		minutes = Math.floor(seconds/60);
		seconds = seconds - minutes*60;
	}
	formatted = formatted + ("0" + minutes).substr(-2,2) + ":";
	formatted = formatted + ("00" + Math.floor(seconds)).substr(-2,2);
	return formatted;
}

function getComments() {
	var message = {time: player.getCurrentTime()};
	$.getJSON(updateCommentsCall, message, function(data) {
		comments.json = data;
		console.log(data);
		var replies = "";
		$.each(data, function(key, val) {
			replies = replies + "<div class='comment' style='display:none;' data-time='" + val.videoTime + "'>";
			replies = replies + "<span class='reply_info'>Posted by " + val.displayname;
			replies = replies + " at " + timeFormat(val.videoTime) + "</span>";
			if(val.user_id === user_id.toString()) {
				replies = replies + "<div class='modify'><a class='edit'>Edit</a> | <a class='delete'>Delete</a></div>";
			}
			else {
				replies = replies + "<a class='reply'>Reply</a>"
			}
			replies = replies + "<p>" + val.comment + "</p></div>\n";
		});
		$("#comments").html(replies);
		
	});
}

$(document).ready(function() {

	$(document.body).on('click', '.edit', function(event){
		pauseVideo();
		var tag = $(this)[0].outerHTML;
		var len = tag.length;
		var text = $(this).parent().html();
		text = text.substring(0, text.length - len);
		$(this).parent().html("<textarea>" + text + "</textarea>");
	});
	$(document.body).on('click', '.delete', function(event) {
		pauseVideo();
		if(confirm("Delete comment")) {
			console.log("Confirmed");
		}
	});
	$("#comment").focus(function() {
		pauseVideo();
	});
	$("#submitComment").click(function(){
		var message = {
			time: Math.floor(player.getCurrentTime()),
			comment: $("#comment").val()
		};
		$.post(commentCall, message, function(data) {
			$("#submitStatus").html(data);
			console.log(data);
		});
		playVideo();
		comments.lastTime = 0;
		getComments();
	});
});

