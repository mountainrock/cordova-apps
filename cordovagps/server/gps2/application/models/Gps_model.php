<?php

class Gps_model extends CI_Model {
	
	function __construct() {
		parent::__construct();
                date_default_timezone_set('asia/kolkata');
	}
	
	function getRoutesForUser($userId){
	
	    $query = $this->db->query('SELECT * FROM gpslocations l join user u  on l.deviceId=u.deviceId where u.userId='.$userId.' order by l.gpsTime asc');
	    return $query->result();
	}
	
	function getRoutesForDevice($deviceId){
	    $query = $this->db->query('SELECT * FROM gpslocations where deviceId=\''.$deviceId.'\''.' order by gpsTime asc');
	    return $query->result();
	}
	
	function getRouteForMapbySession($sessionId, $userId){
	     $query = $this->db->query("SELECT *,u.userName userName2 FROM gpslocations l join user u on l.deviceId=u.deviceId where l.sessionID='".$sessionId."' and u.userId=".$userId.' order by l.gpsTime asc' );
	    return $query->result();   
	    
	}
    
    function getAllUnmappedDevices($customerId) {
	   $sql = "SELECT distinct l.deviceId from gpslocations l where l.deviceId not in (select deviceId from user u where u.customerId='".$customerId."')";
	   $query = $this->db->query($sql);
	   return $query->result(); 
	   
	}
    
      	
	function createGpsLocation(){
	 	
		$latitude       = isset($_GET['latitude']) ? $_GET['latitude'] : '0';
		$latitude       = (float)str_replace(",", ".", $latitude); // to handle European locale decimals
		$longitude      = isset($_GET['longitude']) ? $_GET['longitude'] : '0';
		$longitude      = (float)str_replace(",", ".", $longitude);    
		$speed          = isset($_GET['speed']) ? $_GET['speed'] : 0;
		$direction      = isset($_GET['direction']) ? $_GET['direction'] : 0;
		$distance       = isset($_GET['distance']) ? $_GET['distance'] : '0';
		$distance       = (float)str_replace(",", ".", $distance);
		$date           = isset($_GET['date']) ? $_GET['date'] : '0000-00-00 00:00:00';
		$date           = urldecode($date);
		$locationMethod = isset($_GET['locationmethod']) ? $_GET['locationmethod'] : '';
		$locationMethod = urldecode($locationMethod);
		$userName       = isset($_GET['username']) ? $_GET['username'] : 0;
		$phoneNumber    = isset($_GET['phonenumber']) ? $_GET['phonenumber'] : '';
		$sessionID      = isset($_GET['sessionid']) ? $_GET['sessionid'] : 0;
		$accuracy       = isset($_GET['accuracy']) ? $_GET['accuracy'] : 0;
		$extraInfo      = isset($_GET['extrainfo']) ? $_GET['extrainfo'] : '';
		$eventType      = isset($_GET['eventtype']) ? $_GET['eventtype'] : '';
		$deviceId       = isset($_GET['deviceId']) ? $_GET['deviceId'] : '';
		$customerId	= isset($_GET['customerId']) ? $_GET['customerId'] : '';
		
		$data = array(
	 		'latitude'  =>  $latitude,
		        'longitude' => $longitude,
		        'speed' => 	$speed,
		        'direction' => $direction,
		        'distance' => $distance,
		        'gpsTime'  => $date, 
		        'locationMethod' => $locationMethod, 
		        'userName' => $userName, 
		        'phoneNumber' => $phoneNumber,  
		        'sessionID' => $sessionID, 
		        'accuracy' => $accuracy, 
		        'extraInfo' => $extraInfo, 
		        'eventType' => $eventType,
		        'deviceId'  => $deviceId,
		        'customerId' => $customerId
	        	);
	        	
		$this->db->insert('gpslocations', $data);
	
	}


        function createGpsLocationJson(){
                $data = file_get_contents('php://input');	 	
	 	$json = json_decode($data, true);

	        if(isset($json['deviceId']) )
		         log_message('debug', 'deviceId : '.$json['deviceId']);
	 	
		$latitude       = isset($json['location']) ? $json['location']['latitude'] : '0';
		$latitude       = (float)str_replace(",", ".", $latitude); // to handle European locale decimals
		$longitude      = isset($json['location']) ? $json['location']['longitude'] : '0';
		$longitude      = (float)str_replace(",", ".", $longitude);    
		$speed          = isset($json['location']['speed']) ? $json['location']['speed'] : 0;
		$direction      = isset($json['location']['bearing']) ? $json['location']['bearing'] : 0;
		$distance       = isset($json['location']['distance']) ? $json['location']['distance'] : '0';
		$distance       = (float)str_replace(",", ".", $distance);
		if(isset($json['location']['recorded_at'])){
		 	 $dateStr=  strtotime($json['location']['recorded_at']);
         		 $dateStr = ''.date('Y-m-d H:i:s', $dateStr);;
       		 }
		$date           = isset($json['location']['recorded_at']) ?  $dateStr : '0000-00-00 00:00:00';
		$date           = urldecode($date);
		$locationMethod = isset($json['locationmethod']) ? $json['locationmethod'] : '';
		$locationMethod = urldecode($locationMethod);
		$userName       = isset($json['username']) ? $json['username'] : '-';
		$phoneNumber    = isset($json['phonenumber']) ? $json['phonenumber'] : '';
		$sessionID      = isset($json['sessionid']) ? $json['sessionid'] :  date('D M d Y',strtotime($dateStr));
		$accuracy       = isset($json['location']['accuracy']) ? $json['location']['accuracy'] : 0;
		$extraInfo      = isset($json['extrainfo']) ? $json['extrainfo'] : '';
		$eventType      = isset($json['eventtype']) ? $json['eventtype'] : '';
		$deviceId       = isset($json['deviceId']) ? $json['deviceId'] : '';
		$customerId	= isset($json['customerId']) ?$json['customerId'] : '';
		
		$data = array(
	 		'latitude'  =>  $latitude,
		        'longitude' => $longitude,
		        'speed' => 	$speed,
		        'direction' => $direction,
		        'distance' => $distance,
		        'gpsTime'  => $date, 
		        'locationMethod' => $locationMethod, 
		        'userName' => $userName, 
		        'phoneNumber' => $phoneNumber,  
		        'sessionID' => $sessionID, 
		        'accuracy' => $accuracy, 
		        'extraInfo' => $extraInfo, 
		        'eventType' => $eventType,
		        'deviceId'  => $deviceId,
		        'customerId' => $customerId
	        	);
	        	
		$this->db->insert('gpslocations', $data);
	
	}
	
	function getCurrentUsersLocation($sessionId){
	    $query = "select u.userName, u.deviceId,gpsTime lastGpsTime, g.latitude, g.longitude from gpslocations g left join user u on g.deviceId=u.deviceId  where sessionID='".$sessionId."' and gpsTime IN  ( SELECT MAX(gpsTime) FROM gpslocations g1 where sessionID='".$sessionId."' and g1.deviceId=u.deviceId)  group by u.deviceId";

	    $queryObj = $this->db->query($query);
	    return $queryObj->result();
	}

}
?>