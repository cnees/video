
var videoChart = {
	enabled: false,
	toggleGraph: function() {
		this.enabled = !this.enabled;
		if(this.enabled) videoChart.drawChart();
		$('#chartWrapper').toggle();
	},
	drawChart: function() {
		if(!this.enabled) return;
		var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
		var graphData = [['% Video Time', 'Views']];
		$.get(GRAPHCALL, {video_id: VIDEO_ID}, function(functionData) {
			var split = functionData.split(",");
			for(var i = 0; i < split.length; i++) {
				thing = ['', parseInt(split[i])];
				graphData.push(thing);
			}
			var options = {
				title: 'Views over Video Time',
				hAxis: {title: 'Time'},
				vAxis: {title: 'Views'},
				legend: 'none'
			};
			chart.draw(google.visualization.arrayToDataTable(graphData), options);
		});
	}
}

google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(videoChart.drawChart);


function onYouTubeIframeAPIReady() {videoPlayer.createPlayer();}

function onPlayerReady(event) {videoPlayer.playerReady(event);}

function onPlayerStateChange(event) {videoPlayer.stateChange(event);}

function timeFormat(seconds) {
	// Input: Time in seconds
	// Output: Time in (H:)MM:SS format
	// Example outputs: 1:44:04, 01:22, 00:01, 141:02:01
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

var videoComments = {
	// TODO: Scroll to newest comments
	getComments: function (parentID) {
		if(typeof(parentID)==='undefined') parentID = -1;
		var message = {
			parentMessageID: parentID
		};
		$.getJSON(UPDATECOMMENTCALL, message, function(data) {
			//console.log("JSON parentID: " + typeof(parentID));
			//console.log("JSON parentID: " + parentID.toString());
			//console.log(data);
			var replies = "";
			$.each(data, function(key, val) {
				try {
					var currentTime = videoPlayer.player.getCurrentTime();
				}
				catch(e) {
					var currentTime = 0;
				}
				var active = "inactive";
				var displayMode = "block";
				if(val.videoTime <= currentTime) {
					active = "active";
				}
				if(parentID != -1) {
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
				replies = replies + "<span style='float:right'><a class='reply' data-id='" + val.id + "'>Contribute</a> | <a class='report' data-id='" + val.id + "'>Report</a></span>";
				var truefalse = (val.user_id === USER_ID.toString())?"true":"false";
				var editable = "";
				if(val.user_id === USER_ID.toString()) {
					editable = " editable";
				}
				replies = replies + "<br><div contenteditable='" + truefalse + "' class='message" + editable + "' data-id='" + val.id + "'>" + val.comment + "</div></div>\n";
			});
			if(parentID == -1) {
				$("#comments").html(replies);
			}
			else {
				replies = "<div class='contributions'>" + replies + "</div>";
				//console.log($(".message[data-id=" + parentID + "]").html());
				$(".message[data-id=" + parentID + "]").parent().append(replies);
				//console.log("Appending replies: " + replies);
			}
			videoComments.display();
		});
	},

	updateInterval: null, // videoPlayer will set updateInterval when the video has loaded. The interval will call display periodically.

	setUpdateInterval: function(i) {
		if(this.updateInterval === null) {
			this.updateInterval = setInterval(function() {videoComments.display();}, i * 1000);
		}
	},

	unsetUpdateInterval: function() {
		clearInterval(this.updateInterval);
		this.updateInterval = null;
	},

	lastUpdate: 0,

	display: function() {
		var currentTime = videoPlayer.player.getCurrentTime();
		//$("#clock").html(timeFormat(currentTime));
		if(currentTime >= Math.floor(videoComments.lastUpdate)) {
			for(i = Math.floor(videoComments.lastUpdate); i <= currentTime; i++) {
				$("[data-time='" + i + "']").removeClass("inactive").addClass("active");
			}
		}
		else{
			for(i = Math.floor(currentTime); i <= videoComments.lastUpdate; i++) {
				$("[data-time='" + i + "']").removeClass("active").addClass("inactive");
			}
		}
		videoComments.lastUpdate = currentTime;
	}
}

var videoPlayer = {

	player: null,

	createPlayer: function() {
		this.player = new YT.Player('player', {
			videoId: VIDEO_ID, // Defined in HTML
			playerVars: {rel:0},
			events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange
			}
		});
	},

	playerReady: function(event) {
		this.player.playVideo();
		videoComments.getComments();
		videoComments.setUpdateInterval(0.1);
		videoViews.initialize();
		videoViews.setUpdateInterval();
		// Every second, check which comments to make black or gray
	},

	loadAPI: function() {
		// This code loads the IFrame Player API code asynchronously.
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	},

	stateChange: function(event) {
		if (event.data == YT.PlayerState.PLAYING) {
			videoComments.setUpdateInterval(1);
			videoViews.setUpdateInterval();

		}
		else { // Not playing
			videoComments.unsetUpdateInterval();
			videoViews.unsetUpdateInterval();
		}
		if(event.data == YT.PlayerState.ENDED) {
			videoViews.sendToDB();
		}
	},

	playTime: function(cut, duration) {
		videoPlayer.player.playVideo();
		videoPlayer.player.seekTo(cut[0]);
		setTimeout(
			function() {videoPlayer.playTimes(cut, duration, 0);},
			duration[0]*1000
		);
	},

	playTimes: function(cut, duration, i) {
		// Don't access this function directly. Use videoPlayer.playTime instead.
		var offset = cut[i] + duration[i] - videoPlayer.player.getCurrentTime();
		if(offset > 0) { // Check that player has reached end of interval
			setTimeout( // Delay until end of interval
				function() {videoPlayer.playTimes(cut, duration, i);},
				offset*1000
			);
		}
		else if(i < cut.length) {
			// Start next interval
			++i;
			videoPlayer.player.seekTo(cut[i]);
			setTimeout(
				function() {videoPlayer.playTimes(cut, duration, i);},
				duration[i]*1000
			);
		}
		else {
			videoPlayer.player.pauseVideo();
		}
	}
}

var videoViews = {
	interval: 1, // Number of seconds per bin
	binCount: 100, // Number of bins
	bins: null, // Array of bins
	updateInterval: null,
	counter: 0, // Number of times videoViews has been updated since last database update
	setUpdateInterval: function() {
		if(this.updateInterval === null) {
			this.updateInterval = setInterval(function() {videoViews.updateViews();}, this.interval * 1000);
		}
	},
	unsetUpdateInterval: function() {
		clearInterval(this.updateInterval);
		this.updateInterval = null;
	},
	initialize: function() { // Don't initialize until the videoPlayer is ready
		var duration = videoPlayer.player.getDuration();
		this.interval = Math.max(Math.ceil(duration / 100), 1);
		this.binCount = Math.ceil(duration / this.interval);
		this.bins = Array.apply(null, new Array(this.binCount)).map(Number.prototype.valueOf,0) // Zero filled array of size binCount
		this.setUpdateInterval(this.interval);
	},
	updateViews: function () {

		var bin = Math.floor(videoPlayer.player.getCurrentTime() / this.interval); // Round down to nearest interval
		this.bins[bin] += 1;
		this.counter++;
		//console.log(this.bins);
		//console.log("Counter: " + this.counter);
		if(this.counter === 5) {
			this.sendToDB();
		}
	},
	sendToDB: function() {
		this.counter = 0;
		var message = {
			vector: this.bins.toString()
		};
		$.post(VIEWSCALL, message, function(data) {
			//console.log(data);
		});
		var i = this.bins.length - 1;
		while(i >= 0) this.bins[i--] = 0;
		//this.bins.map(function(){return 0;}); // Reset views to zero after adding them to the database
		var message = {
			video_id: VIDEO_ID
		};
		videoChart.drawChart();
	}
}

var videoBookmarks = {
	getBookmarks: function () {
		var getBookmarksMessage = {
			fetch: "true"
		};
		$.getJSON(BOOKMARKCALL, getBookmarksMessage, function(data) {
			//console.log(data);
			var times = "";
			$.each(data, function(key, val) {
				times = times + "<a data-bookmark='" + val.videoTime + "' class='bookmark'>&nbsp;" + timeFormat(val.videoTime) + "&nbsp;</a>";
			});
			times = "<button id='editBookmarks' alt='Edit bookmarks' title='Edit bookmarks'>X</button> " + times;
			//TODO: Disable button when there are no comments
			$("#bookmarks").html(times);
		});
	}
}

var videoFormActions = {
	confirm_delete: function(thisButton, message) {
		if(confirm(message)) {
			this.delete(thisButton);
		}
	},

	delete: function(thisButton) {
		videoPlayer.player.pauseVideo();
		var grandparent = thisButton.parent().parent();
		grandparent.children('.editing').removeClass('editing').addClass('editable');
		//console.log(grandparent.children('.message').attr('data-id'));
		var messageID = grandparent.children('.message').attr('data-id');
		grandparent.remove();
		//console.log("Message id: " + messageID);
		var postmessage = {
			delete: messageID
		};
		$.post(DELETECOMMENTCALL, postmessage, function(data) {
			//$("#submitStatus").html(data);
		});
		comments.lastTime = 0;
		videoComments.getComments();
	}
}
		
$(document).ready(function() {

	videoPlayer.loadAPI();
	videoBookmarks.getBookmarks();

	$(document.body).on('click', '.message.editable', function(event){
		videoPlayer.player.pauseVideo();
		var buttons = "<div class='changeComment'><button class='update'>Update</button> <button class='cancel'>Cancel Edit</button> <button class='delete'>Delete Comment</button></div>\n";
		$(this).after(buttons);
		$(this).removeClass('editable').addClass('editing');
	});
	
	$('div').on('click', '.delete', function(event) {
		event.stopPropagation();
		videoFormActions.confirm_delete($(this), "Do you want to delete this post and all its replies?");
	});

	$('div').on('click', '.update', function(event) {
		event.stopPropagation();
		videoPlayer.player.pauseVideo();
		var message = $(this).parent().siblings('.message');
		var nonWhitespaceCharacter = /\S/;
		if(!nonWhitespaceCharacter.test(message.text())) { // Check if string contains only whitespace
			videoFormActions.confirm_delete($(this),
				"Message is empty. Do you want to delete this post and all its replies?"
			);
		}
		else {
			var postmessage = {
				comment: message.text(),	// TODO: Make this preserve line breaks
				update: message.attr('data-id')
			};
			$.post(COMMENTCALL, postmessage, function(data) {/*$("#submitStatus").html(data);*/});
			$(this).parent().parent().children('.editing').removeClass('editing').addClass('editable');
			$(this).parent().remove();
		}
	});

	$('div').on('click', '.reply', function(event) {
		// TODO: Clear text from reply box and scroll to comment on submit
		event.stopPropagation();
		videoPlayer.player.pauseVideo();
		var message = $(this).parent().parent().children('.message');
		if(!message.hasClass("replying")){
			var buttons = "<button class='submitReply'>Submit</button> <button class='cancelReply'>Cancel</button>\n";
			$(this).parent().parent().append("<div class='replyContainer'><div class='replyBox' contenteditable='true'></div>" + buttons + "</div>");
			message.addClass('replying');
		}
		else {
			$(this).parent().siblings(".replyContainer").remove();
			$(this).parent().parent().children('.replying').removeClass('replying');
		}
	});
	
	$('div').on('click', '.cancelReply', function(event) {
		$(this).parent().parent().children('.replying').removeClass('replying');
		$(this).parent().remove();
	});

	$('div').on('click', '.view_replies.load_replies', function(event) {
		var container = $(this).parent().parent();
		var parent_id = container.children('.message').attr('data-id');
		videoComments.getComments(parent_id);
		$(this).removeClass("load_replies").addClass("toggle_replies");
	});

	$('div').on('click', '.view_replies.toggle_replies', function(event) {
		var box = $(this).parent().parent().children('.contributions');
		box.toggle();
	});

	$('div').on('click', '.submitReply', function(event) {
		event.stopPropagation();
		var parentMessage = $(this).parent().parent().children('.replying');
		//console.log("Posting reply: " + $(this).parent().children('.replyBox').html());
		var replymessage = {
			time: Math.floor(videoPlayer.player.getCurrentTime()),
			comment: $(this).parent().children('.replyBox').html(),
			replyTo: parentMessage.attr('data-id')
		};
		$.post(COMMENTCALL, replymessage, function(data) {
			//console.log(data);
			comments.lastTime = 0;
			videoComments.getComments();
		});
		parentMessage.removeClass('replying');
		//console.log("Replied to message " + parentMessage.attr('data-id'));
	});

	$(document.body).on('click', '.cancel', function(event) {
		$(this).parent().parent().children('.editing').removeClass('editing').addClass('editable');
		// TODO: Restore original text when edit is canceled
		$(this).parent().remove();
	});

	$("#comment").focus(function() {
		videoPlayer.player.pauseVideo();
	});

	$("#submitComment").click(function(){
		var message = {
			time: Math.floor(videoPlayer.player.getCurrentTime()),
			comment: $("#comment").val()
		};
		$.post(COMMENTCALL, message, function(data) {
			//console.log(data);
			$("#comment").val("");
			videoComments.lastUpdate = 0;
			videoComments.getComments();
		});
	});

	$("#saveNote").click(function(){
		var message = {
			time: Math.floor(videoPlayer.player.getCurrentTime()),
			note: $("#comment").val()
		};
		$.post(COMMENTCALL, message, function(data) {
			$("#comment").val("");
			videoComments.lastUpdate = 0;
			videoComments.getComments();
		});
	});

	$(document.body).on('click', '.report', function(){
		//console.log("Reporting " + $(this).attr('data-id'));
		videoPlayer.player.pauseVideo();
		if(confirm("Report this message?")) {
			$(this).parent().parent().children(".message").html("-reported-");
			var report_id = $(this).parent().parent().children('.message').attr('data-id');
			var message = {id: report_id};
			$.post(REPORTCALL, message, function(data) {
				//console.log(data);
			});
		}
	});

	$(document.body).on('click', '#playCut', function(){
		var times = [103, 153, 432, 597, 755, 779, 997, 1004];
		var durations = [13, 4, 5, 3, 13, 18, 4, 0];
		videoPlayer.playTime(times, durations, 0);
	});

	$(document.body).on('click', '#editBookmarks', function(){
		//console.log("Edit mode");
		$(this).attr("id", "doneEditingBookmarks");
		$(this).html("&#10003;");
		$("#bookmarks").addClass("removing");
		editMode = true;
	});

	$("#bookmark").click(function(){
		var time = Math.floor(videoPlayer.player.getCurrentTime());
		var message = {
			bookmark: time
		};
		//console.log(message);
		$.post(BOOKMARKCALL, message, function(data) {
			//console.log(data);
		});
		// TODO: Sort appended bookmarks by time?
		// TODO: Prevent appending duplicate bookmarks
		$("#bookmarks").append("<a data-bookmark='" + time + "' class='bookmark'>&nbsp;" + timeFormat(time) + "&nbsp;</a>");
	});

	var editMode = false;

	$(document.body).on('click', '.bookmark', function(){
		if(editMode) {
			var message = {
				forget: $(this).attr("data-bookmark")
			};
			$.post(BOOKMARKCALL, message, function(data) {
				//console.log(data);
			});
			$(this).remove();
		}
		else {	
			var time = $(this).attr("data-bookmark");
			videoPlayer.player.seekTo(time);
		}
	});


	$(document.body).on('click', '#doneEditingBookmarks', function(){
		editMode = false;
		$(this).html("X");
		$(this).attr("id", "editBookmarks");
		$("#bookmarks").removeClass("removing");
	});
	
	$('#sendData').click(function() {
		videoViews.sendToDB();
	});

	$("#toggleGraph").click(function(){
		videoChart.toggleGraph();
	});

	$(document.body).on('click', '#settings_save', function(){
		var message = {
			video_id: $("input[name='video']").val()
		};
		$.post(ADDVIDEOCALL, message, function(data){
			//console.log(data);
		});
	});

});