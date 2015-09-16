<?php
defined('BASEPATH') OR exit('No direct script access allowed');


class Gps extends CI_Controller {

        private $CI;

	public function __construct() {
	        parent::__construct();
       	        header('Access-Control-Allow-Origin: *');
	        $this->load->model("Gps_model", "gps", TRUE);
	        $this->load->database();
	        $this->load->helper(array('form', 'url', 'date', 'cookie'));
	        $this->load->library('session');
	        $this->load->helper('url');
	        $this->load->library('form_validation');
	        date_default_timezone_set('asia/kolkata');
	        
       }

        public function login()
	{
		$this->load->view('auth/login');
	}
        //GPS 
        
	public function showMap()
	{
		$this->load->view('common/panels');
		$this->load->view('displaymap');
	}
		
	public function getRoutesForUser(){
		if(isset($_REQUEST['userId'])){
	       		 $routes = $this->gps->getRoutesForUser($_REQUEST['userId']);
	        }else if(isset($_REQUEST['deviceId'])){
	        	$routes = $this->gps->getRoutesForDevice($_REQUEST['deviceId']);
	        }
	        $res['success']="";
	        $locations= array();
	        $sessionGroup = array();
	        
		foreach ($routes as $row){ //assumes locations are in ascending order of gpsTime
		    $sessionId =  $row->sessionID;
		    $gpsTime = $row->gpsTime;
		   // echo $sessionId.'-'. $gpsTime.' = '.isset($sessionGroup[$sessionId]).'<br/>';
		    if (isset($sessionGroup[$sessionId])==false) {
		    	$sessionGroup[$sessionId] = array($gpsTime,'');	
		    	array_push($locations,$row);
		    }else{
		    	$sessionGroup[$sessionId][1]=$gpsTime;
		    }	     
		}
		foreach ($locations as $location){ //update gps start and end time
			$sgroup = $sessionGroup[$location->sessionID];
			$location->gpsTime = $sgroup[0].' - '.$sgroup[1];
		}
		
		$res['locations']= $locations;
		header('Content-Type: application/json');
		if (isset($_REQUEST['jsonpCallback']) || isset($_REQUEST['callback'])){
		    echo "loadRoutes(".json_encode($res).")";
		}else{
		   echo json_encode($res);
		}
	}

	public function getRoutesForMapBySession(){	
		$sessionid = $_REQUEST['sessionId'];
		
		if(isset($_REQUEST['userId']) ==false){
		    $deviceId = $_REQUEST['deviceId'];
		    $this->db->where('deviceId ',$deviceId );
                    $userResult= $this->db->get('user');
                    $userId= $userResult->row()->userId;
		}else{
		    $userId = $_REQUEST['userId'];
		}
		$routes = $this->gps->getRouteForMapbySession($sessionid, $userId);
		 
	        $res['success']="";
	        $locations= array();
		foreach ($routes as $row){
		    array_push($locations,$row);		     
		}
		$res['locations']= $locations;
		header('Content-Type: application/json');
		if (isset($_REQUEST['jsonpCallback']) || isset($_REQUEST['callback'])){
		    echo "loadGPSLocations(".json_encode($res).")";
		}else{
		    echo json_encode($res);
		}
	}
	
	public function createGpsLocation(){
		$this->gps->createGpsLocation();
		$date = new DateTime();
		$latitude       = isset($_GET['latitude']) ? $_GET['latitude'] : '0';
		$longitude      = isset($_GET['longitude']) ? $_GET['longitude'] : '0';
                $deviceId       = isset($_GET['deviceId']) ? $_GET['deviceId'] : '';

	        $uri = base_url();
       	        log_message('info','==== Foreground Submit : ' . $uri.', deviceId :'.$deviceId.',  lat ,long: ' . $latitude.', '.$longitude);

		echo $date->format('Y-m-d H:i') . "";
	}

        public function createGpsLocationBackground(){
		$this->request_logger();
		$this->gps->createGpsLocationJson();
		$date = new DateTime();
		echo $date->format('Y-m-d H:i') . "";
	}
	
	 public function request_logger(){
		$data = file_get_contents('php://input');
	 	$json = json_decode($data,true);

	        $uri = base_url();
	        log_message('debug', '====== Bakckground Submit: ' . $uri. ', data : '.$data);
	      
	 }

	 function getCurrentUsersLocation(){
	     $locations= $this->gps->getCurrentUsersLocation($_REQUEST['sessionId']);
	     $res['locations']= $locations;
	    
	     $json = json_encode($res);
	     echo $json;
	 }

	//util
	function getTimestamp(){
	
	   echo date('Y-m-d H:i:s');
	}
	
}