<?php
//common DB operations

     function getListOfValue($category, $tableName, $columns, $labelColumn, $where){

 			$sql = "SELECT * FROM $tableName where $where";
             //echo $sql;
 			$rs= getResultset($sql);
 			$requestsAr= array();
 			if(!$rs->EOF){
 				while (!$rs->EOF){
 					$request1 = array();
 					$label="";
 				    foreach($columns as $column){
 				      $request1[$column]= $rs->Fields[$column]->value;
 				    }
					$request1['label'] = $request1[$labelColumn];
 					$rs->MoveNext();
 					array_push($requestsAr,$request1);
 				}
 			}

			$data=$requestsAr;
 			//$data[$category."s"]=$requestsAr;
 			//$data[$category."Count"]=$rs->RecordCount();

 			$rs->Close();
 			return json_encode($data);
    }

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

    function getFieldValue($sql){
			$conn = getConnection();
			$rs = new COM('ADODB.Recordset') or die('Coult not make rs');
			//echo "Executing query :".$sql."<br/>";
			$rs->Open($sql, $conn, 1, 3);
			$value="";
			if(!$rs->EOF){
				$value = $rs->Fields[ 0]->value;
			}
			$rs->Close();
			return $value;
    }

    function getConnection(){
       $connstring = "Provider=Microsoft.Jet.OLEDB.4.0; Data Source= " . $GLOBALS['dirPath'] . "\\" . $GLOBALS['dbName'] . " ;Jet OleDB:Database Password=" . $GLOBALS['dbPassword'] ;
       $conn = new COM('ADODB.Connection') or die('Could not make conn');
      // echo 'Connected to MS access '.$connstring.'<br/>';
	   $conn->Open($connstring);
	   return $conn;
   }

   function create_guid($namespace = '') {
		static $guid = '';
		$uid = uniqid("", true);
		$data = $namespace;
		$data .= $_SERVER['REQUEST_TIME'];
		$data .= $_SERVER['HTTP_USER_AGENT'];
		$data .= $_SERVER['LOCAL_ADDR'];
		$data .= $_SERVER['LOCAL_PORT'];
		$data .= $_SERVER['REMOTE_ADDR'];
		$data .= $_SERVER['REMOTE_PORT'];
		$hash = strtoupper(hash('ripemd128', $uid . $guid . md5($data)));
		$guid = substr($hash,  0,  8) .
				'-' .
				substr($hash,  8,  4) .
				'-' .
				substr($hash, 12,  4) .
				'-' .
				substr($hash, 16,  4) .
				'-' .
				substr($hash, 20, 12)
				;
		return $guid;
  	}

   function logi($str){
	  error_log(date("F j, Y, g:i a")." ".$str."\n", 3, $GLOBALS['logPath']);

   }

 ?>