<?php
defined('BASEPATH') OR exit('No direct script access allowed');


class Setting extends CI_Controller {

	public function __construct() {
	        parent::__construct();
       	        header('Access-Control-Allow-Origin: *');
	        $this->load->model("Settings_model", "setting", TRUE);
                $this->load->model("User_model", "user", TRUE);
	        $this->load->database();
	        $this->load->helper(array('form', 'url', 'date', 'cookie'));
	        $this->load->library('session');
	        $this->load->helper('url');
	        $this->load->library('form_validation');
	        date_default_timezone_set('asia/kolkata');
	       
       }
	
	public function showSettings(){             
                $customerId = $this->session->userdata('customerId');
                $data['settings']= $this->getSettings($customerId);
                $this->load->view('common/panels');
		$this->load->view('settings', $data);
	}

	public function getSettingsJson(){
	     $customerId= $_REQUEST['customerId'];
	     $settings= $this->getSettings($customerId);
             $jsonSettings = json_encode($settings); 
             $deviceId= isset($_REQUEST['deviceId']) ? $_REQUEST['deviceId'] : null;
             if($deviceId!=null){
                 $userResult=$this->user->getUserName($deviceId);
                 $userName ="NA";
                 if($userResult!=null){
                     $userName = $userResult[0]->userName;
                 }
                 $settingsAr = json_decode( $jsonSettings, true);
                 $settingsAr['userName']=$userName;
                 $jsonSettings = json_encode($settingsAr);
                 
             }

             header('Content-Type: application/json');

             if (isset($_REQUEST['jsonpCallback']) || isset($_REQUEST['callback'])){
		    echo "loadSettingsFromServer(". $jsonSettings .")";
	     }else{
		   echo $jsonSettings;
	     }
	}
      
      public function getSettings($customerId){
               
 		$limit=1000; $sidx="lastUpdate"; $sord="desc";
		$where = "customerId = '". $customerId."' and name like 'setting.%' ";
                $result=$this->setting->getAllSettings(0, $limit, $sidx, $sord, $where) ;
                $kvSettings = array();
                foreach ($result as $row) {
                  // echo $row->name.' -  '.$row->value;
                   $name = substr($row->name, strlen("setting."));
                   $kvSettings[$name] = $row->value;
                }  
                return $kvSettings;

       }
       
       public function saveSettings(){
		$mon= $_REQUEST['mon'];
		$tue= $_REQUEST['tue'];
		$wed= $_REQUEST['wed'];
		$thu= $_REQUEST['thu'];
		$fri= $_REQUEST['fri'];
		$sat= $_REQUEST['sat'];
		$sun= $_REQUEST['sun'];
		$customerId= $_REQUEST['customerId'];
		$workHours = array($mon, $tue, $wed, $thu, $fri, $sat, $sun);
		
		$autostart= $_REQUEST['autostart'];
		$debug = $_REQUEST['debug'];
		$locationToggle = $_REQUEST['locationToggle'];
		$gpsDistanceFilter = $_REQUEST['gpsDistanceFilter'];
		$gpsAccuracy = $_REQUEST['gpsAccuracy'];
		$gpsMaxAge = $_REQUEST['gpsMaxAge'];
		$serverUrl = $_REQUEST['serverUrl'];
                $taskServerUrl = $_REQUEST['taskServerUrl'];
                $apkServerUrl = $_REQUEST['apkServerUrl'];
                $autoTurnOnGps = $_REQUEST['autoTurnOnGps'];
        	
            $this->form_validation->set_rules('customerId', 'Customer Id', 'required');
            $this->form_validation->set_rules('serverUrl', 'server Url', 'required');
            $this->form_validation->set_rules('taskServerUrl', 'Task server Url', 'required');
            $this->form_validation->set_rules('apkServerUrl', 'APK server Url', 'required');
            $this->form_validation->set_rules('gpsMaxAge', 'Gps max age', 'required|numeric');
            $this->form_validation->set_rules('gpsAccuracy', 'Gps accuracy', 'required|numeric');
            $this->form_validation->set_rules('gpsDistanceFilter', 'Gps distance filter', 'required|numeric');            

            if ($this->form_validation->run() == FALSE){
               echo'<div class="alert alert-danger">'.validation_errors().'</div>';
               exit;
            }
            else{
        	$this->setting->updateSetting("setting.workHours", join(',', $workHours), $customerId);
        	$this->setting->updateSetting("setting.autostart", $autostart, $customerId);
        	$this->setting->updateSetting("setting.debug", $debug, $customerId);
        	$this->setting->updateSetting("setting.locationToggle", $locationToggle, $customerId);
        	$this->setting->updateSetting("setting.gpsDistanceFilter", $gpsDistanceFilter, $customerId);
        	$this->setting->updateSetting("setting.gpsAccuracy", $gpsAccuracy, $customerId);
        	$this->setting->updateSetting("setting.gpsMaxAge", $gpsMaxAge, $customerId);
        	$this->setting->updateSetting("setting.serverUrl", $serverUrl, $customerId);
                $this->setting->updateSetting("setting.taskServerUrl", $taskServerUrl, $customerId);
                $this->setting->updateSetting("setting.apkServerUrl", $apkServerUrl, $customerId);
                $this->setting->updateSetting("setting.autoTurnOnGps", $autoTurnOnGps, $customerId);
                echo '<div class="alert alert-success">Saved successfully!!</div>';
          }
       }

	
	
	
	
}