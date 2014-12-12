<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";
$LTI = \Tsugi\Core\LTIX::requireData(array('link_id', 'user_id'));

use \Tsugi\Core\Settings;
echo "<select id='graphStudents'>";
echo "\t<option value=''>All Users</option>";
if($USER->instructor) {
	$users = $PDOX->allRowsDie("SELECT displayname, user_id FROM {$CFG->dbprefix}lti_user WHERE displayname IS NOT NULL");
	foreach($users as $user) {
		echo "<option value='" . $user['user_id'] . "'>" . $user['displayname'] . "</option>";
	}
}
else {
	echo "<option value='" . $USER->id . "'>Me</option>";
}

echo "</select>";