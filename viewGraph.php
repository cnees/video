<?php
	$total_views = $PDOX->rowDie("SELECT * FROM video_views
		WHERE link_id = :LID
		LIMIT 1;",
		array(
			":LID" => $LINK->id
		)
	);
	$total_views_vector = array_map("intval", explode(",", $total_views['view_vector']));

	$view_array_string = "";
	//echo "Count: " + count($comments);
	foreach($total_views_vector as $views) {
		$view_array_string .= "[''," . $views . "],";
	}
?>
<html>
  <head>
    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
    <script type="text/javascript">
      google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(drawChart);
function drawChart() {

  var data = google.visualization.arrayToDataTable([
    ['Time', 'Views'],
    <?=$view_array_string?>
  ]);

  var options = {
    title: 'Views over Video Time',
    hAxis: {title: 'Time'},
    vAxis: {title: 'Views'},
    legend: 'none'
  };

  var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));

  chart.draw(data, options);

}
    </script>
  </head>
  <body>
    <div id="chart_div" style="width: 900px; height: 500px;"></div>
  </body>
</html>

