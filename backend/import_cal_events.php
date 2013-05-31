<?php
require_once 'google-api-php-client/src/Google_Client.php';
require_once 'google-api-php-client/src/contrib/Google_CalendarService.php';
require('./config.php');
	include('./requests.php');
dbwrite("delete from gigs");
dbwrite("delete from gigs_availability");
foreach (fetch_gigs(0) as $gig) {
	$description =  $gig['description'];
	$entries = explode("\n\n", $description);
	$details = array();
	foreach($entries as $entry) { 
		$bits = explode(': ', $entry, 2);
		if ($bits[0] == 'TIME') {
			$times = explode(' - ', $bits[1]);
			$gig['start_time'] = $times[0];
			$gig['end_time'] = $times[1];
		} else if ($bits[0] == 'EVENT TIME') {
			$times = explode(' - ', $bits[1]);
			$gig['start_time'] = trim($times[0]);
			$gig['end_time'] = trim($times[1]);
		} else if ($bits[0] == 'BAND PLAY TIME') {
			$times = explode(' - ', $bits[1]);
			$gig['band_start'] = trim($times[0]);
			$gig['band_end'] = trim($times[1]);
		} else if($bits[0]) {
			$gig[str_replace(' ', '_', strtolower($bits[0]))] = $bits[1];
		}
	}	
	$gig['title'] = preg_replace('/Proposed Gig: [\d\-]+ /', '', $gig['title']);
	$gig['date'] = $gig['gCalDate'];
	$gig['action'] = 'saveGig'; 
	$gig['google_gig_id'] = $gig['id'];
	$_REQUEST = $gig;
	gigs_saveGig($_REQUEST);
}

function fetch_gigs($new=1, $calendarfeed="https://www.google.com/calendar/feeds/9ap01kto79gs6jddoi8d1e4b38%40group.calendar.google.com/private-d9f3603174475e300a82afac095e7ce5/full/?orderby=starttime&singleevents=true&ctz=America/Los_Angeles") {
    $dateformat="Y-m-d"; // 10 March 2009 - see http://www.php.net/date for details
    $nicedateformat="F j"; // 10 March 2009 - see http://www.php.net/date for details
    $timeformat="g:i A"; // 12.15am
    $cache_time = 60 * .5; // 5 minutes
    date_default_timezone_set('America/Los_Angeles');
	$calendarfeed .= "&max-results=2000";

    $cache_file = '';
    if ($new) {
        $calendarfeed .= "&futureevents=true&sortorder=a";
	$cache_file = '/home/blo/gcal.xml'; //xml file saved on server
    } else { $calendarfeed .= "&sortorder=a"; }

    if ($cache_file) {
        $timedif = @(time() - filemtime($cache_file));
        $xml = "";
        if (file_exists($cache_file) && $timedif < $cache_time) {
            $str = file_get_contents($cache_file);
            $xml = simplexml_load_string($str);
        } else {
            $xml = simplexml_load_file($calendarfeed); //come here
            if ($f = fopen($cache_file, 'w')) { //save info
                $str = $xml->asXML();
                fwrite ($f, $str, strlen($str));
                fclose($f);
            } else { echo "<P>Can't write to the cache.</P>"; }
        }
    } else { $xml = simplexml_load_file($calendarfeed); }

    $items_shown=0;
    $xml->asXML();
    $gigs = array();

    foreach ($xml->entry as $entry){

        $gig = array();
        $ns_gd = $entry->children('http://schemas.google.com/g/2005');

		$gig['id'] = preg_replace("/^.*\/full\/(.+)$/", "$1", $entry->id);
        //Do some niceness to the description
        //Make any URLs used in the description clickable: thanks Adam
        $gig['description'] = preg_replace('/([^\'"])((f|ht)tps?:\/\/[-a-zA-Z0-9@:%_\+.~#?,&\/=]+)/i','$1<a href="$2">$2</a>', $entry->content);

        // These are the dates we'll display
        $gig['gCalDate'] = date($dateformat, strtotime($ns_gd->when->attributes()->startTime));
        $gig['niceDate'] = date($nicedateformat, strtotime($ns_gd->when->attributes()->startTime));
        $gig['gCalDateStart'] = date($dateformat, strtotime($ns_gd->when->attributes()->startTime));
        $gig['gCalDateEnd'] = date($dateformat, strtotime($ns_gd->when->attributes()->endTime));
        $gig['gCalStartTime'] = date($timeformat, strtotime($ns_gd->when->attributes()->startTime));
        $gig['gCalEndTime'] = date($timeformat,strtotime($ns_gd->when->attributes()->endTime));
       
       /* I don't think we need to correct time zone?
        $gig['gCalDate'] = date($dateformat, strtotime($ns_gd->when->attributes()->startTime)+date("Z",strtotime($ns_gd->when->attributes()->startTime)));
        $gig['niceDate'] = date($nicedateformat, strtotime($ns_gd->when->attributes()->startTime)+date("Z",strtotime($ns_gd->when->attributes()->startTime)));
        $gig['gCalDateStart'] = date($dateformat, strtotime($ns_gd->when->attributes()->startTime)+date("Z",strtotime($ns_gd->when->attributes()->startTime)));
        $gig['gCalDateEnd'] = date($dateformat, strtotime($ns_gd->when->attributes()->endTime)+date("Z",strtotime($ns_gd->when->attributes()->endTime)));
        $gig['gCalStartTime'] = gmdate($timeformat, strtotime($ns_gd->when->attributes()->startTime)+date("Z",strtotime($ns_gd->when->attributes()->startTime)));
        $gig['gCalEndTime'] = gmdate($timeformat,strtotime($ns_gd->when->attributes()->endTime)+date("Z",strtotime($ns_gd->when->attributes()->endTime)));
        */
        $gig['title'] = $entry->title;
		if ($entry->title == 'Rehearsal') { continue; }
        $gig['where'] = $ns_gd->where->attributes()->valueString;

       // $gig['map'] = "http://maps.google.com/?q=".urlencode($ns_gd->where->attributes()->valueString);
        // Accept and translate HTML
        foreach(array_keys($gig) as $key) {
            $gig[$key]=str_replace("&lt;","<",$gig[$key]);
            $gig[$key]=str_replace("&gt;",">",$gig[$key]);
            $gig[$key]=str_replace("&quot;","\"",$gig[$key]);
        }
        $gigs[] = $gig;
    }
    return $gigs;
}
?>

