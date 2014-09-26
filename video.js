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
			replies = replies + "<a class='reply'>Reply</a>";
			var truefalse = (val.user_id === user_id.toString())?"true":"false";
			var editable = "";
			if(val.user_id === user_id.toString()) {
				editable = " editable";
			} 
			replies = replies + "<br><div contenteditable='" + truefalse + "' class='message" + editable + "' data-id='" + val.id + "'>" + val.comment + "</div></div>\n";
		});
		$("#comments").html(replies);
	});
}

$(document).ready(function() {

	$(document.body).on('click', '.message.editable', function(event){
		pauseVideo();
		console.log("editing");
		var buttons = "<div class='changeComment'><button class='update'>Update</button> <button class='cancel'>Cancel Edit</button> <button class='delete'>Delete Post</button></div>\n";
		$(this).after(buttons);
		$(this).removeClass('editable').addClass('editing');
	});
	$('div').on('click', '.delete', function(event) {
		pauseVideo();
		if(confirm("Delete comment")) {
			console.log("Delete clicked");
		}
	});
	$('div').on('click', '.update', function(event) {
		pauseVideo();
		console.log("Update clicked");
		var message = $(this).parent().siblings('.message');
		console.log(message.html());
		console.log(message.attr("data-id"));
		var postmessage = {
			comment: message.html(),
			update: message.attr("data-id")
		};
		$.post(commentCall, postmessage, function(data) {
			$("#submitStatus").html(data);
			console.log(data);
		});
	});
	$(document.body).on('click', '.cancel', function(event) {
		pauseVideo();
		console.log("Cancel clicked");
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

