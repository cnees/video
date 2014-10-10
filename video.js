var comments = {
	json: null,
	lastTime: 0,
	display: function(videoTime) {
		var currentTime = player.getCurrentTime();
		if(currentTime >= this.lastTime) {
			for(i = Math.floor(this.lastTime); i <= currentTime; i++) {
				$("[data-time='" + i + "']").show();
			}
		}
		else if(currentTime < this.lastTime) {
			for(i = Math.floor(currentTime); i <= this.lastTime; i++) {
				$("[data-time='" + i + "']").hide();
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
		videoId: VIDEO_ID,
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

function getComments(parent_id) {
	if(typeof(parent_id)==='undefined') parent_id = -1;
	console.log("parent_id: " + parent_id);
	console.log("parent_id type: " + typeof(parent_id));
	var message = {
		time: player.getCurrentTime(),
		parentMessageID: parent_id
	};
	$.getJSON(UPDATECOMMENTCALL, message, function(data) {
		console.log("JSON parent_id: " + typeof(parent_id));
		console.log("JSON parent_id: " + parent_id.toString());
		comments.json = data;
		var replies = "";
		$.each(data, function(key, val) {
			var currentTime = player.getCurrentTime();
			var displayMode = "none";
			if(parent_id != -1 || val.videoTime <= currentTime) {
				displayMode = "block";
			}
			replies = replies + "<div class='comment' style='display:" + displayMode + ";' data-time='" + val.videoTime + "'>";
			replies = replies + "<span class='reply_info'>Posted by " + val.displayname;
			replies = replies + " at " + timeFormat(val.videoTime);
			if(val.replies > 0) {
				replies = replies + " | <a class='view_replies load_replies'>" + val.replies;
				if(val.replies > 1) replies = replies + " replies"; // plural
				else replies = replies + " reply"; // singular
				replies = replies + "</a>";
			}
			replies = replies + "</span>";
			replies = replies + "<a class='reply'>Contribute</a>";
			var truefalse = (val.user_id === USER_ID.toString())?"true":"false";
			var editable = "";
			if(val.user_id === USER_ID.toString()) {
				editable = " editable";
			}
			replies = replies + "<br><div contenteditable='" + truefalse + "' class='message" + editable + "' data-id='" + val.id + "'>" + val.comment + "</div></div>\n";
		});
		if(parent_id == -1) {
			$("#comments").html(replies);
		}
		else {
			replies = "<div class='contributions'>" + replies + "</div>";
			console.log($(".message[data-id=" + parent_id + "]").html());
			$(".message[data-id=" + parent_id + "]").parent().append(replies);
			console.log("Appending replies: " + replies);
		}
	});
}

$(document).ready(function() {

	$(document.body).on('click', '.message.editable', function(event){
		pauseVideo();
		console.log("editing");
		var buttons = "<div class='changeComment'><button class='update'>Update</button> <button class='cancel'>Cancel Edit</button> <button class='delete'>Delete Comment</button></div>\n";
		$(this).after(buttons);
		$(this).removeClass('editable').addClass('editing');
	});
	
	$('div').on('click', '.delete', function(event) {
		pauseVideo();
		if(confirm("Do you want to delete this post and all its replies?")) {
			console.log("Delete clicked");
			$(this).parent().parent().children('.editing').removeClass('editing').addClass('editable');
			
			console.log($(this).parent().parent().children('.message').attr('data-id'));
			var messageID = $(this).parent().parent().children('.message').attr('data-id');
			$(this).parent().parent().remove();
			console.log("Message id: " + messageID);
			var postmessage = {
				delete: messageID
			};
			$.post(DELETECOMMENTCALL, postmessage, function(data) {
				$("#submitStatus").html(data);
			});
		}
	});

	$('div').on('click', '.update', function(event) {
		pauseVideo();
		var message = $(this).parent().siblings('.message');
		var postmessage = {
			comment: message.html(),
			update: message.attr('data-id')
		};
		$.post(COMMENTCALL, postmessage, function(data) {
			$("#submitStatus").html(data);
		});
		$(this).parent().parent().children('.editing').removeClass('editing').addClass('editable');
		$(this).parent().remove();
	});

	$('div').on('click', '.reply', function(event) {
		pauseVideo();
		var message = $(this).parent().children('.message');
		if(!message.hasClass("replying")){
			var buttons = "<button class='submitReply'>Submit</button> <button class='cancelReply'>Cancel</button>\n";
			$(this).parent().append("<div class='replyBox' contenteditable='true'></div>" + buttons);
			message.addClass('replying');
		}
		console.log("Replying to message " + message.attr('data-id'));
	});

	$('div').on('click', '.view_replies.load_replies', function(event) {
		var container = $(this).parent().parent();
		var parent_id = container.children('.message').attr('data-id');
		getComments(parent_id);
		/*var message = {
			parentID: parent_id
		}
		$.getJSON(REPLIESCALL, message, function(data) {
			var comments = "<div class='contributions'>";
			$.each(data, function(key, val) {
				comments = comments + "<div class='contribution'>" + val.comment + "</div>\n";
			});
			comments = comments + "</div>";
			container.append(comments);
		});*/
		$(this).removeClass("load_replies").addClass("toggle_replies");
	});

	$('div').on('click', '.view_replies.toggle_replies', function(event) {
		var box = $(this).parent().parent().children('.contributions');
		box.toggle();
		box.
		console.log("Toggling " + box.attr("class"));
	});

	$('div').on('click', '.submitReply', function(event) {
		
		var parentMessage = $(this).parent().children('.replying');
		console.log("Posting reply: " + $(this).parent().children('.replyBox').html());
		var message = {
			time: Math.floor(player.getCurrentTime()),
			comment: $(this).parent().children('.replyBox').html(),
			replyTo: parentMessage.attr('data-id'),
			time: Math.floor(player.getCurrentTime())
		};
		$.post(COMMENTCALL, message, function(data) {
			$("#submitStatus").html(data);
			console.log(data);
		});
		comments.lastTime = 0;
		getComments();

		parentMessage.removeClass('replying');
		console.log("Replied to message " + parentMessage.attr('data-id'));
	});

	$(document.body).on('click', '.cancel', function(event) {
		$(this).parent().parent().children('.editing').removeClass('editing').addClass('editable');
		$(this).parent().remove();
	});

	$("#comment").focus(function() {
		pauseVideo();
	});

	$("#submitComment").click(function(){
		var message = {
			time: Math.floor(player.getCurrentTime()),
			comment: $("#comment").val()
		};
		$.post(COMMENTCALL, message, function(data) {
			$("#submitStatus").html(data);
			console.log(data);
		});
		comments.lastTime = 0;
		getComments();
	});
});

