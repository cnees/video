<?php
require_once "../../config.php";
require_once $CFG->dirroot."/pdo.php";
$LTI = \Tsugi\Core\LTIX::requireData(array('link_id', 'user_id'));

use \Tsugi\Core\Settings;
echo "<select id='graphStudents'>";
echo "\t<option value=''>All Users</option>";
if($USER->instructor) {
	$users = $PDOX->allRowsDie("SELECT displayname, U.user_id 
        FROM {$CFG->dbprefix}video_views_by_student V
        JOIN {$CFG->dbprefix}lti_user AS U
            ON V.user_id = U.user_id
        WHERE V.link_id = :LID AND displayname IS NOT NULL",
        array(":LID" => $LINK->id)
    );
	foreach($users as $user) {
		echo "<option value='" . $user['user_id'] . "'>" . $user['displayname'] . "</option>";
	}
}
else {
	echo "<option value='" . $USER->id . "'>Me</option>";
}

echo "</select>";
