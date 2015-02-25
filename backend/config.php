<?php
require_once('config.local.php');

require_once('dbaccess.php');

$calendars = [
	'private'=>[
		'calendar_id'=> "",
		'id_field'=> "google_calendar_id",
		'start_field'=> "meet_time",
		'end_field'=> "band_end",
	],
	'public'=>[
		'calendar_id'=> "",
		'id_field'=> "google_public_calendar_id",
		'start_field'=> "start_time",
		'end_field'=> "end_time",
	],
];

$emails = ['foo@bar.com'];

$google_api = [
	'accessToken'=>"",
	'ApplicationName'=>"Giggity App",
	'ClientId'=>'',
	'ClientSecret'=>'',
	'RedirectUri'=>''
];


function xml2array($xml) {
        $object = new SimpleXMLElement($xml);
        $array = array();
        $meta = array();
        foreach($object->attributes() as $prop=>$value) {
                $meta[$prop] = "".$value;
        }
        foreach($object as $item) {
                $entry = array();
                foreach($item->attributes() as $prop=>$value) {
                        $entry[$prop] = "".$value;
                }
                $array[] = $entry;
        }
        return array($meta, $array);
}


?>
