
var videoChart = {
	enabled: false,
	toggleGraph: function(on) {
		this.enabled = on;
		if(this.enabled) videoChart.drawChart();
		this.enabled ? $("#graphSection").show() : $("#graphSection").hide();
	},
	drawChart: function() {
		if(!this.enabled) return;
		var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
		var graphData = [['% Video Time', 'Views']];
		//console.log($("#graphStudents").val());
		$.get(GRAPHCALL, {video_id: VIDEO_ID, student_id: $("#graphStudents").val()}, function(functionData) {
			console.log(functionData);
			var split = functionData.split(",");
			for(var i = 0; i < split.length; i++) {
				thing = ['', parseInt(split[i])];
				graphData.push(thing);
			}
			var options = {
				title: 'Views over Video Time',
				hAxis: {title: 'Time (start through end of video)'},
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
	parseComment: function(val, parentID){
		var replies = "";
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
		replies = replies + " at <a data-bookmark='" + val.videoTime + "' class='bookmark'>" + timeFormat(val.videoTime) + "</a>";
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
		return replies;
	},

	// TODO: Scroll to newest comments
	getComments: function (parentID) {
		
		if(typeof(parentID)==='undefined') parentID = -1;
		
		var message = {parentMessageID: parentID};
		
		$.getJSON(UPDATECOMMENTCALL, message, function(data) {
		
			var replies = "";

			$.each(data, function(key, val) {
				replies += videoComments.parseComment(val, parentID);
			});
		
			if(parentID == -1) $("#comments").html(replies); // All comments
			else { // All replies to a comment
				replies = "<div class='contributions'>" + replies + "</div>";
				$(".message[data-id=" + parentID + "]").parent().append(replies);
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
		videoBookmarks.initializeSlider();
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
		console.log(cut);
		console.log(duration);
		videoPlayer.player.playVideo();
		videoPlayer.player.seekTo(cut[0]);
		setTimeout(
			function() {videoPlayer.playTimes(cut, duration, 0);},
			duration[0]*1000
		);
	},

	playTimes: function(cut, duration, i) {
		console.log("Called playTimes");
		// Don't access this function directly. Use videoPlayer.playTime instead.
		var offset = cut[i] + duration[i] - videoPlayer.player.getCurrentTime();
		var waitForEndTime = function(){
		    clearInterval(waitInterval);
		    offset = cut[i] + duration[i] - videoPlayer.player.getCurrentTime();
		    console.log("Offset: " + offset);
		    if(offset > 10) {
		    	waitInterval = setInterval(waitForEndTime, offset);
		    }
		    else {
		    	console.log("Finished with offset " + offset);
		    }
		}
		var waitInterval = setInterval(waitForEndTime, offset);
		/*if(offset > 0) { // Check that player has reached end of interval
			console.log("Delaying");
			setTimeout( // Delay until end of interval
				function() {videoPlayer.playTimes(cut, duration, i);},
				offset*1000
			);
		}
		else */if(i < cut.length) {
			// Start next interval
			console.log("Starting new interval");
			++i;
			if(duration[i] === -1) {
				videoPlayer.player.pauseVideo();
			}
			else {
				videoPlayer.player.seekTo(cut[i]);
				setTimeout(
					function() {videoPlayer.playTimes(cut, duration, i);},
					duration[i]*1000
				);
			}
		}
		else {
			console.log("Pausing");
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

	newSlider: function() {
		// returns a sortable DOM object with a slider inside
		var videoLength = videoPlayer.player.getDuration();
		var sliderString = "<div class='slider'></div>";
		var sliderElt = $(sliderString);
		sliderElt = sliderElt.slider({
			range:true,
			max: videoLength,
			values: [0, videoLength],
			change: function(event, ui) {
				var listItem = $(this).parent();
				listItem.attr('data-start', ui.values[0]);
				listItem.attr('data-duration', ui.values[1] - ui.values[0]);
				console.log($("#cuts").sortable("toArray", {attribute: "data-start"}));
				console.log($("#cuts").sortable("toArray", {attribute: "data-duration"}));
			}
		});
		var listItem = $("<li data-start='0' data-duration='" + videoLength + "'><br><div class='options'><button class='glyphicon glyphicon-remove'></button> <button class='glyphicon glyphicon-plus'></button></div></li>");
		listItem.prepend(sliderElt);
		return listItem;
	},

	initializeSlider: function() { // Only initialize this after the player is ready.
		console.log("Initializing slider");
		$("#cuts").sortable();
		$("#cuts").append(videoBookmarks.newSlider());
	},

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
	},
	search: function() {
		var searchInput = $("#search");
		var query = searchInput.val();
		$("#search").val("");
		var message = {
			search: query
		};
		console.log(query);
		$.getJSON(UPDATECOMMENTCALL, message, function(data) {
			console.log(data);
			var hits = "";
			$.each(data, function(key, val) {
				hits += videoComments.parseComment(val);
			});
			if(hits === "") hits = "No hits";
			hits = "<span class='glyphicon glyphicon-remove' style='float:right' id='hideSearchResults'></span><br>" + hits;
			$('#searchResults').html(hits);
			$('#searchResults').show();
		});
	}
}
		
$(document).ready(function() {

	videoPlayer.loadAPI();
	videoBookmarks.getBookmarks();

	$("#commentsTab").click(function(){
		$("#commentsSection").show();
		$("#bookmarksSection").hide();
		$("#cutsSection").hide();
		videoChart.toggleGraph(false); // Turn off graph
	});	
	$("#bookmarksTab").click(function(){
		$("#commentsSection").hide();
		$("#bookmarksSection").show();
		$("#cutsSection").hide();
		videoChart.toggleGraph(false); // Turn off graph
	});	
	$("#cutsTab").click(function(){
		$("#commentsSection").hide();
		$("#bookmarksSection").hide();
		$("#cutsSection").show();
		videoChart.toggleGraph(false); // Turn off graph
	});	
	$("#graphTab").click(function(){
		$("#commentsSection").hide();
		$("#bookmarksSection").hide();
		$("#cutsSection").hide();
		videoChart.toggleGraph(true); // Turn on graph

	});

	$('#search').submit(function(){
		videoFormActions.search();
	});

	$('#search').keypress(function (event) {
        if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {
        	videoFormActions.search();
        }
    });

	$('#searchButton').click(function(){
		videoFormActions.search();
	});

	$('#search').submit(function(){
		videoFormActions.search();
	});

	$('#search').keypress(function (event) {
        if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {
        	videoFormActions.search();
        }
    });

	$('#searchButton').click(function(){
		videoFormActions.search();
	});

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
		// TODO: Scroll to comment on submit
		event.stopPropagation();
		videoPlayer.player.pauseVideo();
		var message = $(this).parent().parent().children('.message');
		if(!message.hasClass("replying")){
			var buttons = "<button class='submitReply'>Submit</button> <button class='cancelReply'>Cancel</button>\n";
			$(this).parent().parent(3).append("<div class='replyContainer'><div class='replyBox' contenteditable='true'></div>" + buttons + "</div>");
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
		var replymessage = {
			time: Math.floor(videoPlayer.player.getCurrentTime()),
			comment: $(this).parent().children('.replyBox').html(),
			replyTo: parentMessage.attr('data-id')
		};
		$.post(COMMENTCALL, replymessage, function(data) {
			comments.lastTime = 0;
			videoComments.getComments();
		});
		parentMessage.removeClass('replying');
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

	$(document.body).on('click', '#playCuts', function(){
		var times = $("#cuts").sortable("toArray", {attribute: "data-start"});
		var durations = $("#cuts").sortable("toArray", {attribute: "data-duration"});
		times.push(0);
		durations.push(-1);
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

	$(document.body).on('click', '.options .glyphicon-plus', function() {
		$(this).parent().parent().after(videoBookmarks.newSlider());
	});

	$(document.body).on('click', '.options .glyphicon-remove', function() {
		if($(this).parent().parent().siblings("li").size() >= 1) {
			$(this).parent().parent().remove();
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

	$("#graphStudents").change(function() {
		console.log("Drawing chart");
		videoChart.drawChart();
	});

	$(document.body).on('click', '#settings_save', function(){
		var message = {
			video_id: $("input[name='video']").val()
		};
		$.post(ADDVIDEOCALL, message, function(data){
			//console.log(data);
		});
	});

	$(document.body).on('click', "#hideSearchResults", function(){
		$("#searchResults").hide();
	});

});