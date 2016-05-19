<?php
if (php_sapi_name() != "cli") { print "nope"; exit(); }
require_once('requests.php');
dbWrite("alter table gigs drop column if exists gig_data");
dbWrite("alter table gigs add column gig_data longtext");
dbWrite("update gigs set gig_data = '';");
$times = "";
foreach(array('meet_time', 'band_start', 'band_end', 'start_time', 'end_time') as $t) {
  $times .= ", time_format($t, '%H:%i') as $t ";
}
$gigs = dbLookupArray("select * $times from gigs");

foreach($gigs as $gig) {
	$gig['publish'] = false;
  if (isset($gig['setlist']) && is_string($gig['setlist'])) {
    $gig['setlist'] = array_filter(explode(",", $gig['setlist']));
  } else {
    $gig['setlist'] = array();
  }
  $request = array(
    "gig_id" => $gig['gig_id'],
    "data" => $gig
  );
  gigs_saveGig($request);
}
foreach(['title','description','location','approved', 'who','contact', 'details', 'tactical', 'musical', 'public_description', 'notes', 'colors', 'url', 'setlist', 'start_time', 'end_time', 'band_end', 'meet_time', 'google_public_calendar_id', 'google_calendar_id'] as $field) {
  dbWrite("alter table gigs drop column $field");
}

?>
