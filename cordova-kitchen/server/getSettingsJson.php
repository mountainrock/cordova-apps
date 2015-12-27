<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
 	include("config.php");
	include("common-db.php");

	ob_start();

	if($_GET["action"] =="getSettings"){
		$deviceId = $_GET['deviceId'];
		checkDeviceMappingExists($deviceId);
         $settingsAr =  array();
		 $settingsAr["serverUrl"] = $serverUrl;
		 $settingsAr["taskServerUrl"] = $taskServerUrl;
		 $settingsAr["apkServerUrl"] = $updateUrl;
		 $settingsAr["license"] = $license;		
 
		echo json_encode($settingsAr);
	}

    function checkDeviceMappingExists($deviceId){
				if($deviceId ==null || $deviceId =='' ){
				  die('{"error": "deviceId or invoiceNo is required"}');
				}
    			$sqlCheckEmployeeDevice = "select * from EmployeeDevice where DeviceId='".$deviceId."'";

	    		$rs1 = getResultset($sqlCheckEmployeeDevice);
	    		if($rs1->RecordCount() ==0){
	    		  //no mapping exists. create a temp mapping
					$userName = isset($_GET['userName'])? $_GET['userName'] : "NA";
					$sqlCheckEmployeeDeviceTemp = "select * from EmployeeDeviceTemp where DeviceId='".$deviceId."'";
					$rs2 = getResultset($sqlCheckEmployeeDeviceTemp);
					if($rs2->RecordCount() ==0){
						$sqlInsertTempEmpDevice = "insert into EmployeeDeviceTemp values('". $userName ."','". $deviceId ."')";
						executeUpdate($sqlInsertTempEmpDevice);
					}
					die('{"error": "No mapping exists for your device = '.$deviceId.'. Contact admin!"}');

    		}
    }

?>


