<?php

class Gps_model extends CI_Model {
	
	function __construct() {
		parent::__construct();
	}
	
	function getRoutesForUser($userId){
	
	    $query = $this->db->query('SELECT * FROM gpslocations l join user u  on l.deviceId=u.deviceId where u.userId='.$userId);
	    return $query->result();
	}
	
	function getRoutesForDevice($deviceId){
	    $query = $this->db->query('SELECT * FROM gpslocations where deviceId=\''.$deviceId.'\'');
	    return $query->result();
	}
	
	function getRouteForMapbySession($sessionId){
	     $query = $this->db->query("SELECT * FROM gpslocations where sessionID='".$sessionId."'");
	    return $query->result();   
	    
	}
    
    
       //user     
    
	function loginUser($userName,$password, $customerId){
		$this->db->select('userId,userName,deviceId,phoneNumber,created,customerId')
			->where('userName',$userName)
			->where('password',$password)
			->where('customerId',$customerId);
			
		 return $this->db->get('user')->result(); 
	}
	
	
	
	function getAllUsers($start, $limit, $sidx, $sord, $where1) {
	
	    $this->db->select('userId,userName,deviceId,phoneNumber,created,customerId');
	    $this->db->limit($limit);
	    if ($where1 != NULL)
	        $this->db->where($where1, NULL, FALSE);
	    $this->db->order_by($sidx, $sord);
	    $query = $this->db->get('user', $limit, $start);
	   // echo "users $limit $start --  $where1 --".implode(",", $query->result());
	    return $query->result();
	}
	
	
	public function createUser(){
	    $data = array('userName'=>  $this->input->post('userName'),
	        'deviceId'=>$this->input->post('deviceId'),
	        'phoneNumber'=>$this->input->post('phoneNumber'),
	        'created'=>date('d/m/y'),
	        'customerId'=>$this->input->post('customerId'));
	    $this->db->insert('user', $data);
	    echo'<div class="alert alert-success">One record inserted Successfully</div>';
	    exit;
	}
	
	function updateUser($id, $data) {
		$this->db->where('userId', $id );
		return $this->db->update('user', $data);
			
	}
	
	function deleteUser($id) {
		 $this->db->where('userId', $id);
	    	 $this->db->delete('user');
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
}
?>