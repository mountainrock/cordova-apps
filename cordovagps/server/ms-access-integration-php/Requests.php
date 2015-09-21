<?php
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');
    include("config.php");


	ob_start();

	if($_GET["action"] =="getRequests"){
		//eg: http://localhost/jcrm/Requests.php?action=getRequests&deviceId=92f51e498f121ea2
		$customerRequestsJson = getCustomerRequests();
		if (isset($_REQUEST['jsonpCallback']) || isset($_REQUEST['callback'])){
		    echo "loadTasks(".$customerRequestsJson.")";
		}else{
		//log(" $customerRequestsJson\n");
		    echo $customerRequestsJson;
		}



	}
	else if($_GET["action"] =="updateStatus"){
		//eg: http://localhost/jcrm/Requests.php?action=updateStatus&requestId=1&statusId=2&deviceId=92f51e498f121ea2
		updateRequestStatus();
		if (isset($_REQUEST['jsonpCallback']) || isset($_REQUEST['callback'])){
				    echo 'updateTaskResponse({"status":"updated"})';
		}else{
				    echo '{"status":"updated"}';
		}

    }

    function updateRequestStatus(){
    		$statusId= $_GET['statusId'];
		    $requestId= $_GET['requestId'];
		    $deviceId= $_GET['deviceId'];
		    if($statusId ==null || $requestId == null){
			   die('statusId and requestId is required');
    		}
			$updateSql ="update CustomerRequest set StatusID=".$statusId." where RequestID=".$requestId;
			//TODO: log deviceId from which update was done
			logi("Update request :: deviceId : " . $deviceId . ", statusId :" . $statusId. ", requestId : ".$requestId);
			$result = executeUpdate($updateSql);
    }

    function getCustomerRequests(){

    		$deviceId = $_GET['deviceId'];
    		if($deviceId ==null || $deviceId ==''){
    		  die('{"error": "deviceId is required"}');
    		}
			checkDeviceMappingExists($deviceId);
			$requestsAr= array();
			$sql = "SELECT * FROM (( CustomerRequest cr ".
							" left join StatusMaster sm on cr.StatusID=sm.StatusID )".
							" left join ProductArea pa on cr.AreaID=pa.AreaID)".
							" left join EmployeeDevice ed on cr.EmployeeID= ed.EmployeeID".
							" WHERE ed.DeviceID='".$deviceId."' and cr.StatusID=1 order by RequestDate desc";

			$rs= getResultset($sql);
			if(!$rs->EOF){
				while (!$rs->EOF){
					$request1 = array(
										'RequestID' => $rs->Fields['RequestID']->value,
										'CustomerName' => $rs->Fields['CustomerName']->value,
										'ContactNo' => $rs->Fields['ContactNo']->value,
										'Address' => $rs->Fields['Address']->value,
										'Status' => $rs->Fields['StatusText']->value,
										'NoOfLocks' => $rs->Fields['NoOfLocks']->value,
										'RequestDate' => $rs->Fields['RequestDate']->value,
										'AreaName' => $rs->Fields['AreaName']->value
					);
					//print $rs->Fields['CustomerName']->value .' - '. $rs->Fields['Address']->value . '<br />';
					$rs->MoveNext();
					array_push($requestsAr,$request1);
				}
			}

			$data["requests"]=$requestsAr;
			$data["recordCount"]=$rs->RecordCount();
			$rs->Close();

			return json_encode($data);
    }

    function checkDeviceMappingExists($deviceId){
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

    //common DB operations
    function executeUpdate($sql){
   		   $conn = getConnection();
   		   $result = $conn->Execute($sql);
   		   return $result;
    }

    function getResultset($sql){
			$conn = getConnection();
			$rs = new COM('ADODB.Recordset') or die('Coult not make rs');
			//echo "Executing query :".$sql."<br/>";
			$rs->Open($sql, $conn, 1, 3);
			//echo "Found : " . $rs->RecordCount()."<br/>";
			return $rs;
    }

    function getConnection(){
       $connstring = "Provider=Microsoft.Jet.OLEDB.4.0; Data Source= " . $GLOBALS['dirPath'] . "\\" . $GLOBALS['dbName'] . " ;Jet OleDB:Database Password=" . $GLOBALS['dbPassword'] ;
       $conn = new COM('ADODB.Connection') or die('Could not make conn');
      // echo 'Connected to MS access '.$connstring.'<br/>';
	   $conn->Open($connstring);
	   return $conn;
   }

   function logi($str){
	  error_log($str."\n", 3, $GLOBALS['logPath']);

   }

?>
