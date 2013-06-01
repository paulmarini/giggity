<?php
$debug = 1;
if (! isIncluded()) {
	header('Content-type: application/json');
}
set_error_handler('handleError');
require_once('config.php');

if (0 && $setgooglecal) { 
	if (isset($_GET['code'])) {
		$stuff = getGoogleClient();
		$client = $stuff[0];
		  $client->authenticate();
			$_SESSION['token'] = $client->getAccessToken();
		print_r($_SESSION);	
	}
}

if (isset($_SERVER['CONTENT_TYPE']) && strstr($_SERVER['CONTENT_TYPE'],'application/json')) { 
	$request = json_decode(file_get_contents('php://input'), true);
} else {
	$request = $_REQUEST;
}

if(isset($request['action'])) {
	$function = 'gigs_'.$request['action'];
	if (function_exists($function)) { 
		$data = $function($request);
		setResponse(1, 'Success', $data);
	} else {
		trigger_error('"'.$request['action'].'" is an invalid method.', E_USER_ERROR);
	}
} else { 
	trigger_error('No action specified', E_USER_ERROR);
}

function getGigTextDescription($gig, $type='email') {
	$gig_details = "";
	$gig['event_time'] = "$gig[start_time] - $gig[end_time]";
	$gig['band_play_time'] = "$gig[band_start] - $gig[band_end]";
	$url = preg_replace('/backend\/requests.php/', "#/gigs?gig_id=$gig[gig_id]", "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]");

	if($type == 'email') { 
		foreach(array('description', 'date', 'event_time', 'band_play_time', 'location', 'who', 'contact') as $key) {
			$gig_details .= str_replace('_', ' ', strtoupper($key)).": $gig[$key]\n\n";
		}
		$gig_details.="---=== DETAILS ===---\n\n$gig[details]";
	} else {
		$availables = array('Yes'=>'', 'No'=>'', 'Maybe'=>'', 'Unknown'=>'');
		foreach($gig['availability'] as $member) {
			$availables[$member['available']] .= "$member[name], ";
		}
		$gig["who's_coming"] = "\n\tYes: $availables[Yes]\n\tMaybe: $availables[Maybe]\n\tNo: $availables[No]"; 
		foreach(array('event_time', 'meet_time', 'band_play_time', 'location', 'tactical', 'musical', 'colors', "who's_coming", 'notes') as $key) {
			$gig_details .= str_replace('_', ' ', strtoupper($key)).": $gig[$key]\n\n";
		}	
		$gig_details.="---=== DETAILS ===---\n\nDESCRIPTION: $gig[description]\n\nWHO: $gig[who]\n\nCONTACT: $gig[contact]\n\n$gig[details]";
	}
	
	$gig_details = "Gig link: $url\n\n$gig_details";

	return $gig_details;
}

function gigs_deleteGig($request) {
	$gig_id = dbEscape($request['gig_id']);
	$gig = gigs_fetchGig($request);
	deleteFromCalendar($gig, 'private');
	deleteFromCalendar($gig, 'public');
	dbWrite("update gigs set deleted=1 where gig_id = $gig_id");
}

function gigs_saveGig($request) {
	$gig_id = dbEscape(isset($request['gig_id']) ? $request['gig_id'] : '');
	$fields = array();
	foreach(array('title','description','date','start_time','end_time','meet_time', 'band_start','band_end','location','who','contact', 'details', 'tactical', 'musical', 'approved', 'public_description', 'notes', 'colors') as $key) { 
		if(isset($request[$key])) {
			if (in_array($key, array('start_time','end_time','meet_time', 'band_start','band_end'))) {
				$request[$key] = date('H:i', strtotime($request[$key]));
			} elseif ($key == 'date') { 
				$date = str_replace('/', '-', $request[$key]);
				$date = date_create_from_format('m-d-Y', $date) ?: date_create_from_format('Y-m-d', $date);
				//$date = date_create_from_format('Y-m-d', $request[$key]);
				$request[$key] = date_format($date, 'Y-m-d');
			}
			array_push($fields, "$key='".dbEscape($request[$key])."'");
		}
	}
	if (! isset($request['details'])) { 
		$details = "";
		foreach(array('cause','event_history','arrestable','has_permit','cops', 'people_of_color','relevant_communities','blo_role','other_groups','sound','other') as $key) { 
			$details .= strtoupper($key).": ".(isset($request[$key]) ? $request[$key] : '')."\n\n";
		}
		array_push($fields, "details='".dbEscape($details)."'");
	}
	//$title = dbEscape($request['title']);
	$new_gig = 0;
	if ($gig_id) { 
		$res = dbWrite("update gigs set ".implode(",", $fields)." where gig_id=$gig_id");
	} else { 
		$res = dbwrite("insert into gigs set ".implode(",", $fields));
		$new_gig = 1;
		$gig_id = getInsertId();	
		$request['gig_id'] = $gig_id;
	}
	$gig = gigs_fetchGig($request);
	saveToCalendar($gig);
	if ($gig['approved'] == 1) {
		saveToCalendar($gig, 'public');
	} elseif ($gig['approved'] == -1) { 
		deleteFromCalendar($gig, 'public');
	}
	if ($new_gig) { 
		sendEmails($gig);
	}
	return $gig;
}

function gigs_fetchGigs($request) {
	$gig_id = isset($request['gig_id']) ? dbEscape($request['gig_id']) : '';
	$where = $gig_id ? " and gig_id = $gig_id " : ' and date > DATE_SUB(NOW(), INTERVAL 1 DAY) ';
	$times ="";
	foreach(array('meet_time', 'band_start', 'band_end', 'start_time', 'end_time') as $t) {
		$times .= ", time_format($t, '%h:%i %p') as $t ";
	}
	$gigs = dbLookupArray("select * $times  from gigs where deleted = 0 $where order by date desc, start_time desc");
	$gigs = fetchAvailability($gigs);
	return $gigs;
}

function gigs_fetchGig($request) {
	$gigs = array_values(gigs_fetchGigs($request));
	return $gigs[0];
}

function fetchAvailability($gigs) { 
	if ($gigs) { 
		$where = " and a.gig_id in(".implode(',', array_keys($gigs)).")";

		$availability = dbLookupArray("select concat(a.gig_id, '_', b.id) as a_id, a.gig_id, b.id as member_id,concat(b.firstname, ' ', b.lastname) as name,  d.available, d.comments, d.concerns, d.other from gigs a join addressbook b join address_in_groups c using(id) left join gigs_availability d on a.gig_id = d.gig_id and b.id = d.member_id where deleted=0 and group_id= 3 $where");
		foreach($availability as $av) { 
			$gig = &$gigs[$av['gig_id']];
			if(! isset($gig['availability'])) { $gig['availability'] = array(); }
			$av['available'] = $av['available'] == '' ? 'Unknown' : $av['available'];
			$gig['availability'][$av['member_id']] = $av;
		}
	}
	return $gigs;
}

function gigs_setAvailability($request) {
	$gig_id = dbEscape(isset($request['gig_id']) ? $request['gig_id'] : '');
	$member_id = dbEscape(isset($request['member_id']) ? $request['member_id'] : '');
	$fields = array();
	foreach(array('available', 'comments', 'concerns', 'other') as $key) { 
		if(isset($request[$key])) {
			array_push($fields, "$key='".dbEscape($request[$key])."'");
		}
	}
	$res = dbwrite("insert into gigs_availability set member_id=$member_id, gig_id=$gig_id, ".implode(",", $fields)." on duplicate key update ".implode(",", $fields));
	$availability = array_values(fetchAvailability(array($gig_id=>array('gig_id'=>$gig_id))));
	$gig = gigs_fetchGig($request);
	saveToCalendar($gig);
	return $availability[0]['availability'];
}

function gigs_fetchMembers() { 
	$members = dbLookupArray("select id, concat(firstname, ' ', lastname) as name, lastname, email, group_concat(group_name) as groups from addressbook join address_in_groups b using(id) left join address_in_groups c using(id) left join group_list d on c.group_id = d.group_id and c.group_id in (6,7,8,9, null) where b.group_id = 3 group by id");
	return $members;
}


function setResponse($statusCode, $statusString, $data="") {
	$response = array('statusCode'=>$statusCode, 'statusString'=>$statusString, 'data'=>$data);
	//if php version < 5.3.0 we need to emulate the object string
	if (PHP_MAJOR_VERSION <= 5 & PHP_MINOR_VERSION < 3){
		print __json_encode($response);
	} else {
		print json_encode($response);
	}
			
	//if ($statusCode != 1) { 
	if (! isIncluded()) {
		exit;
	}
	//}
}

function handleError($errno, $errstr, $errfile, $errline, $errcontext) {
	global $debug;
	$data = array();
	if ($debug) { $errstr = "'$errstr' in file $errfile line $errline "; } //(".print_r($errcontext, 1).")"; }
	setResponse($errno, "$errstr", $data);
	return true;
}


function saveToCalendar($gig, $calendartype='private') {
	global $debug;
	global $calendars;

	extract($calendars[$calendartype]);

	if ($calendartype == 'public' && ! $gig['public_description']) { return; }

	$cal = getGoogleClient();
	$event = new Google_Event();
	$gig_details = "";
	$title = $gig['title'];
	if ($calendartype == 'private') {
		$prefix = 'Proposed';
		if ($gig['approved'] == 1) { 
			$prefix = 'Gig';
		} else if ($gig['approved'] == -1) { 
			$prefix = 'Declined';
		}
		$title = "$prefix: $title";
		$gig_details = getGigTextDescription($gig, 'calendar');
		if (! $gig[$start_field]) { $start_field = 'band_start'; }
	} else { 
		$gig_details = $gig['public_description'];
   	}

	$event->setSummary($title);
	$event->setLocation($gig['location']);
	$event->setStart(newDateTime($gig['date'], $gig[$start_field]));	
	$event->setEnd(newDateTime($gig['date'], $gig[$end_field]));	
	$event->setDescription($gig_details);
	$createdEvent = '';
	if ($gig[$id_field]) {
		$event->setSequence(time());
		$createdEvent = $cal->events->update($calendar_id, $gig[$id_field], $event); 
	} else {
		$createdEvent = $cal->events->insert($calendar_id, $event); 
		$google_gig_id = $createdEvent->getId();
		dbwrite("update gigs set $id_field = '".dbEscape($google_gig_id)."' where gig_id = $gig[gig_id]");
	}
	if(! $createdEvent) { trigger_error('Error creating google calendar entry', E_USER_ERROR); };
}

function deleteFromCalendar($gig, $calendartype='private') {
	global $calendars;
	extract($calendars[$calendartype]);
	if(! $gig[$id_field]) { return; }
	$cal = getGoogleClient();
	$event = new Google_Event();
	$cal->events->delete($calendar_id, $gig[$id_field]); 
	dbwrite("update gigs set $id_field = '' where gig_id = $gig[gig_id]");
}	

function getGoogleClient() {
	require_once('google-api-php-client/src/Google_Client.php');
	require_once('google-api-php-client/src/contrib/Google_CalendarService.php');

	global $google_api;
	extract($google_api);
	$client = new Google_Client();
	$client->setUseObjects(true);
	$client->setAccessType('offline');
	$client->setApplicationName($ApplicationName);
	$client->setClientId($ClientId);
	$client->setClientSecret($ClientSecret);
	$client->setRedirectUri($RedirectUri);
	$client->refreshToken($accessToken);
	$cal = new Google_CalendarService($client);
	return $cal;
}

function newDateTime($date, $time) {
	date_default_timezone_set('America/Los_Angeles');
	$datetime = new Google_EventDateTime();
	$date = date('c', strtotime("$date $time"));	
	$datetime->setDateTime($date);
	$datetime->setTimeZone('America/Los_Angeles');
	return $datetime;
}

function sendEmails($gig) {
	global $emails;
	$gig_details = getGigTextDescription($gig, 'email');
	$title = "Proposed Gig - $gig[date] - $gig[title]";
	foreach($emails as $email_address) {
		mail($email_address, $title, $gig_details, "From: BLO-bot <brassliberation@gmail.com>\r\n"); 
	}
}

function isIncluded() {
	$f = get_included_files();
	return $f[0] != __FILE__;
}

?>
