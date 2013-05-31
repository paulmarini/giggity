<?php 
$title='Gig Request Form';
include_once('header.php');
echo '<h2>Gig Request Form</h2>';
if ($_REQUEST['submit']) {
	$createdEvent = "";
	$debug=0;
	$error = "";
	$gig_details = "";
	$required_fields = array('title', 'description','date', 'start_time', 'end_time','band_start', 'band_end', 'who', 'contact', 'location', 'cause', 'blo_role');
	foreach ($required_fields as $field) { 
		if (! isset($_REQUEST[$field]) || $_REQUEST[$field] == '') { 
			$error = ucwords($field)." is a required field.";
			break;
		}
	}
	if ($error == '') {
		if (!preg_match("/^\d\d\-\d\d\-\d\d\d\d$/", $_REQUEST['date'])) {
			$error = "Date must be in the format 'MM-DD-YYYY'";
		} elseif (!preg_match("/^\d\d:\d\d [AP]M$/", $_REQUEST['start_time']) || !preg_match("/^\d\d:\d\d [AP]M$/", $_REQUEST['end_time']) ||
		!preg_match("/^\d\d:\d\d [AP]M$/", $_REQUEST['band_start']) || !preg_match("/^\d\d:\d\d [AP]M$/", $_REQUEST['band_end'])
		) {
			$error = "Times must be in the format 'HH:MM AM'";
		}
	}
	if ($error == '') {
		$_REQUEST['action'] = 'saveGig';
		ini_set('include_path', ini_get('include_path') . ':./backend/');
		ob_start();
		include_once("requests.php");
		$result = ob_get_clean();
		$json = json_decode($result, true);
		if($json['statusCode'] == 1) {  
			print "<div id='response'>Thank you for submitting your request. A band member will contact you soon. We usually discuss new gigs at our Sunday rehearsals.</div>";
			exit;
		} else {
            $error = $json['statusString'];  
		} 
	}
	
	if ($error) { 
		print "<div id='error'>An error occurred while processing your event: $error<br/> Please review your entry and try again.</div>";
		extract($_REQUEST);
		$event_title = $_REQUEST['title'];
	}
}

?>
<script src="js/validation.js" type="text/javascript"></script>
<script language="javascript">
    Protoplasm.use('datepicker').transform('input.datepicker');
    Protoplasm.use('timepicker').transform('input.timepicker');
    Event.observe(window, 'load', function() { 
    	valid = new Validation('gig_request'); 
    });
</script>


Please fill out this Gig Request Form in order to provide us with a description of and logistical details for the event or action.  We generally need at least two weeks advance notice to make a collective decision and logistimasize our brassiness. We usually discuss new gigs at our Sunday rehearsals.
<p></p>
<form class='gig_request' id='gig_request' method='post'>
<div class='question'><label for='title'>Please give a short title for your event.</label><input class="required" name="title" value='<?php echo $event_title;?>' /></div>
<div class='question'><label for='description'>Please briefly describe your event.</label><textarea class="required" name="description"><?php echo $description;?></textarea></div>
<div class='question'><label for='date'>Date of Event</label><input autocomplete="off"  type="text" name="date" value='<?php echo $date;?>' class="required validate-date datepicker" /></div>
<div class='question'><label for='start_time'>Event start time</label><input autocomplete="off"  id='start_time' type="text" name="start_time" value='<?php echo $start_time;?>' class="timepicker required validate-time" /></div>
<div class='question'><label for='end_time'>Event end time</label><input autocomplete="off"  type="text" name="end_time" value='<?php echo $end_time;?>' class="timepicker required validate-time validate-endtime" /></div>
<div class='question'><label for='band_start'>When do you want the band to start playing?</label><input autocomplete="off"  id='band_start' type="text" name="band_start" value='<?php echo $band_start;?>' class="timepicker required validate-time" /></div>
<div class='question'><label for='band_end'>When do you want the band to stop playing?</label><input autocomplete="off"  type="text" name="band_end" value='<?php echo $band_end;?>' class="timepicker required validate-time validate-bandendtime" /></div>
<div class='question'><label for='location'>Where is the event?</label><input autocomplete="off"  class="required" type="text" name="location" value='<?php echo $location;?>' /></div>
<div class='question'><label for='who'>Who is organizing the event/action?</label><input autocomplete="off"  class="required" type="text" name="who" value='<?php echo $who;?>' /></div>
<div class='question'><label for='contact'>Organizer's contact info (phone & email)?</label><input autocomplete="off"  class="required" type="text" name="contact" value='<?php echo $contact;?>' /></div>
<div class='question'><label for='cause'>What is the cause being advanced and/or the purpose of the event?</label><textarea  class="required" name="cause"><?php echo $cause;?></textarea></div>
<div class='question'><label for='event_history'>What is the history of the event?</label><textarea class="required" name="event_history"><?php echo $event_history;?></textarea></div>
<div class='question'><label for='arrestable'>Is the event arrestable?</label><textarea name="arrestable"><?php echo $arrestable;?></textarea></div>
<div class='question'><label for='has_permit'>Has a permit been attained?</label><input autocomplete="off"  type='radio' name="has_permit" value='<?php echo $has_permit;?>' value='Yes'/>Yes <input autocomplete="off"  type='radio' name="permit" value='<?php echo $permit;?>' value='No'/>No</div>
<div class='question'><label for='cops'>Have the organizers communicated with the police in advance?</label><input autocomplete="off"  type='radio' name="cops" value='<?php echo $cops;?>' value='Yes'/>Yes <input autocomplete="off"  type='radio' name="cops" value='<?php echo $cops;?>' value='No'/>No</div>
<div class='question'><label for='people_of_color'> What is the role and leadership of people of color in connection with the event?</label><textarea name="people_of_color"><?php echo $people_of_color;?></textarea></div>
<div class='question'><label for='relevant_communities'>What is the level of involvement of the relevant communities?</label><textarea name="relevant_communities"><?php echo $relevant_communities;?></textarea></div>
<div class='question'><label for='blo_role'>What would BLO’s role be at the event?</label><textarea class="required" name="blo_role"><?php echo $blo_role;?></textarea></div>
<div class='question'><label for='other_groups'>Will other musical groups be playing? If so, who?</label><textarea name="other_groups"><?php echo $other_groups;?></textarea></div>
<div class='question'><label for='sound_system'>Will there be a sound system?</label><input autocomplete="off"  type='radio' name="sound" value='<?php echo $sound;?>' value='Yes'/>Yes <input autocomplete="off"  type='radio' name="sound_system" value='<?php echo $sound_system;?>' value='No'/>No</div>
<div class='question'><label for='other'>Any other details we should know?</label><textarea name="other"><?php echo $other;?></textarea></div>
<input autocomplete="off"  name='submit' type='submit' value='Submit Gig Request'>
</form>
<?php
include_once('footer.php');

function setDate($datestring, $timestring) {
	$date = new EventDateTime();
	$parts = explode('-', $datestring);
	$newdate =  strftime('%Y-%m-%dT%H:%M:00', strtotime("$parts[2]-$parts[0]-$parts[1] ".$timestring));
	$date->setDateTime($newdate);
	$date->setTimeZone("America/Los_Angeles");
	return $date;
}
?>
