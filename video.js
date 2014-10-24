var comments = {
	json: null,
	lastTime: 0,
	display: function(videoTime) {
		var currentTime = player.getCurrentTime();
		$("#clock").html(timeFormat(currentTime));
		if(currentTime >= this.lastTime) {
			for(i = Math.floor(this.lastTime); i <= currentTime; i++) {
				$("[data-time='" + i + "']").removeClass("inactive").addClass("active");
			}
		}
		else if(currentTime < this.lastTime) {
			for(i = Math.floor(currentTime); i <= this.lastTime; i++) {
				$("[data-time='" + i + "']").removeClass("active").addClass("inactive");
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
		playerVars: {rel:0},
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerReady(event) {
	//$("#player").removeAttr('width').removeAttr('height');
	event.target.playVideo();
	getComments();
	getBookmarks();
}

function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING) {
		displayInterval = setInterval(function() {comments.display();}, 200);
	}
	if (event.data === 0) { // Video done
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

function getBookmarks() {
	var getBookmarksMessage = {
		fetch: "true"
	};
	console.log("Called getBookmarks");
	$.getJSON(BOOKMARKCALL, getBookmarksMessage, function(data) {
		console.log("Callback called");
		console.log(data);
		var times = "";
		$.each(data, function(key, val) {
			times = times + "<a data-bookmark='" + val.videoTime + "' class='bookmark'>&nbsp;" + timeFormat(val.videoTime) + "&nbsp;</a>";
		});
		if(times !== "") {
			times = "<button id='editBookmarks' alt='Edit bookmarks' title='Edit bookmarks'>X</button> " + times;
		}
		$("#bookmarks").html(times);
	});
}

function getComments(parent_id) {
	if(typeof(parent_id)==='undefined') parent_id = -1;
	console.log("parent_id: " + parent_id);
	var message = {
		time: player.getCurrentTime(),
		parentMessageID: parent_id
	};
	$.getJSON(UPDATECOMMENTCALL, message, function(data) {
		console.log("JSON parent_id: " + typeof(parent_id));
		console.log("JSON parent_id: " + parent_id.toString());
		comments.json = data;
		console.log(data);
		var replies = "";
		$.each(data, function(key, val) {
			var currentTime = player.getCurrentTime();
			var active = "inactive";
			var displayMode = "block";
			if(val.videoTime <= currentTime) {
				active = "active";
			}
			if(parent_id != -1) {
				displayMode = "hidden";
			}
			replies = replies + "<div class='comment " + active + "' style='display:" + displayMode + "' data-time='" + val.videoTime + "'>";
			replies = replies + "<span class='reply_info'>";
			replies = replies + ((val.private != 0)? "Note" : ("Posted by " + val.displayname));
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
			var grandparent = $(this).parent().parent();
			grandparent.children('.editing').removeClass('editing').addClass('editable');
			
			console.log(grandparent.children('.message').attr('data-id'));
			var messageID = grandparent.children('.message').attr('data-id');
			grandparent.remove();
			console.log("Message id: " + messageID);
			var postmessage = {
				delete: messageID
			};
			$.post(DELETECOMMENTCALL, postmessage, function(data) {
				//$("#submitStatus").html(data);
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
			//$("#submitStatus").html(data);
		});
		$(this).parent().parent().children('.editing').removeClass('editing').addClass('editable');
		$(this).parent().remove();
	});

	$('div').on('click', '.reply', function(event) {
		pauseVideo();
		var message = $(this).parent().children('.message');
		if(!message.hasClass("replying")){
			var buttons = "<button class='submitReply'>Submit</button> <button class='cancelReply'>Cancel</button>\n";
			$(this).parent().append("<div class='replyContainer'><div class='replyBox' contenteditable='true'></div>" + buttons + "</div>");
			message.addClass('replying');
		}
		console.log("Replying to message " + message.attr('data-id'));
	});

	$('div').on('click', '.cancelReply', function(event) {
		console.log("Class: " + $(this).parent().parent().children('.replying').removeClass('replying'));
		$(this).parent().remove();
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
		console.log("Toggling " + box.attr("class"));
	});

	$('div').on('click', '.submitReply', function(event) {
		event.stopPropagation();
		var parentMessage = $(this).parent().parent().children('.replying');
		console.log("Posting reply: " + $(this).parent().children('.replyBox').html());
		var replymessage = {
			time: Math.floor(player.getCurrentTime()),
			comment: $(this).parent().children('.replyBox').html(),
			replyTo: parentMessage.attr('data-id')
		};
		$.post(COMMENTCALL, replymessage, function(data) {
			//$("#submitStatus").html(data);
			//console.log(data);
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
			//$("#submitStatus").html(data);
			//console.log(data);
		});
		comments.lastTime = 0;
		getComments();
	});

	$("#saveNote").click(function(){
		var message = {
			time: Math.floor(player.getCurrentTime()),
			note: $("#comment").val()
		};
		$.post(COMMENTCALL, message, function(data) {
			console.log("sending note");
		});
		comments.lastTime = 0;
		getComments();
	});

	$("#bookmark").click(function(){
		var time = Math.floor(player.getCurrentTime());
		var message = {
			bookmark: time
		};
		console.log(message);
		$.post(BOOKMARKCALL, message, function(data) {
			console.log("done");
			console.log(data);
		});
		$("#bookmarks").append("<a data-bookmark='" + time + "' class='bookmark'>&nbsp;" + timeFormat(time) + "&nbsp;</a>");
	});

	var editMode = false;

	$(document.body).on('click', '.bookmark', function(){
		console.log("Clicked bookmark");
		if(editMode) {
			var message = {
				forget: $(this).attr("data-bookmark")
			};
			$.post(BOOKMARKCALL, message, function(data) {
				console.log("removed");
				console.log(data);
			});
			$(this).remove();
		}
		else {	
			var time = $(this).attr("data-bookmark");
			player.seekTo(time);
		}

	});

	$(document.body).on('click', '#editBookmarks', function(){
		console.log("Edit mode");
		$(this).attr("id", "doneEditingBookmarks");
		$(this).html("&#10003;");
		$("#bookmarks").addClass("removing");
		editMode = true;
	});

	$(document.body).on('click', '#doneEditingBookmarks', function(){
		editMode = false;
		$(this).html("X");
		$(this).attr("id", "editBookmarks");
		$("#bookmarks").removeClass("removing");

	});
	
});

