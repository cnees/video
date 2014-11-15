<?php
	use \Tsugi\UI\SettingsForm;
	echo "<p style='text-align:right;'>";
	SettingsForm::button(false);
	echo "</p>";
	SettingsForm::start();

?>
<label for="video">
	Please select a YouTube video.<br/>
<?php
	SettingsForm::text('video');
	echo("</label>\n");
	SettingsForm::end();
	//require_once "reports.php";
	//require_once "viewGraph.php";
?>