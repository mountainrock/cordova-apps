<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
 	include("config.php");
	include("common-db.php");

	ob_start();

	if($_GET["action"] =="getInvoices"){
		//eg: http://localhost/cafe/Requests.php?action=getInvoices&deviceId=92f51e498f121ea2
		$invoicesJson = getInvoices();

		//logi("getRequests : ".$_SERVER['REQUEST_URI'] );
		//logi(" $invoicesJson\n");
		echo $invoicesJson;


	}
	else if($_GET["action"] =="takeOrder"){
		//eg: http://localhost/cafe/Requests.php?action=takeOrder&deviceId=92f51e498f121ea2
		$invoiceNo = takeOrderAction();


    }else if($_GET["action"] =="getListOfValue"){
		//eg: http://localhost/cafe/Requests.php?action=getListOfValue&category=table|product|barista&keyword=abc
		$category= $_GET['category'];
		$keyword =  $_GET['keyword'];
		if($category ==null ){
			die('$category is required');
    	}

		if($category =="table"){
			$table = "CafeTable";
			$columns = array("CafeTableName", "CafeTableID");
		    $where = "CafeTableName like '%$keyword%'";
		    $labelColumn = "CafeTableName";

		}else if($category =="product"){
		    $table = "Product";
		    $columns = array("ProductDesc", "ProductNo","ProductCode", "SalesPrice","DefaultQty");
		    $where = "ProductNo like '%$keyword%' or ProductDesc like '%$keyword%' or ProductCode like '%$keyword%'";
		    $labelColumn = "ProductDesc";

		}else if($category =="barista"){
		    $table = "SalesPerson";
		    $columns = array("SalesPersonName","SalesPersonCode");
		    $where = "SalesPersonCode like '%$keyword%' or SalesPersonName like '%$keyword%' ";
		    $labelColumn = "SalesPersonName";
		}

		$categoryJson = getListOfValue($category, $table, $columns ,$labelColumn, $where);
		echo $categoryJson;
    }else if($_GET["action"] =="getOrder"){
		//eg: http://localhost/cafe/Requests.php?action=getOrder&deviceId=92f51e498f121ea2&invoiceNo=12
		$invoiceInfo = getInvoiceDetail();
		echo $invoiceInfo;

    }

    function getInvoiceDetail(){

    		$deviceId = $_GET['deviceId'];
    		$invoiceNo = $_GET['invoiceNo'];
    		if($deviceId ==null || $deviceId =='' || $invoiceNo == null || $invoiceNo==''){
    		  die('{"error": "deviceId or invoiceNo is required"}');
    		}
			checkDeviceMappingExists($deviceId);
			$invoiceHeader= array();
			$sql = "SELECT * FROM SInvoiceHeader  ".
							" WHERE InvoiceNo = $invoiceNo ";
            //echo $sql;
			$rs= getResultset($sql);
			if(!$rs->EOF){
				    $invoiceHeader = array(
										'invoiceNo' => $rs->Fields['InvoiceNo']->value,
										'invoiceDate' => (string)$rs->Fields['InvoiceDate']->value,
										'invoiceAmount' => $rs->Fields['InvoiceAmount']->value,
										'totalQty' => $rs->Fields['TotalQty']->value,
										'salesMan' => $rs->Fields['SalesMan']->value,
										'updateUser' => (string) $rs->Fields['UpdateUser']->value,
										'cafeTableID' => $rs->Fields['CafeTableID']->value
					);

					$rs->Close();
			}
			$invoiceHeader["cafeTableName"] = getFieldValue("select CafeTableName from CafeTable where CafeTableID = ".$invoiceHeader['cafeTableID']);

			//TODO: load invoice details

			$sql = "SELECT * FROM SInvoiceDetail  ".
							" WHERE  InvoiceNo = $invoiceNo ";

			$rs= getResultset($sql);
			$invoiceDetailAr = array();
			if(!$rs->EOF){
				while (!$rs->EOF){
					$invoiceDetail = array(
										'index' => $rs->Fields['LineNo']->value,
										'invoiceNo' => (string)$rs->Fields['InvoiceNo']->value,
										'productDesc' => $rs->Fields['ProductDesc']->value,
										'otherDesc' => $rs->Fields['OtherDesc']->value,
										'qty' => $rs->Fields['Qty']->value,
										'price' => (string) $rs->Fields['Price']->value,
										'total' => $rs->Fields['LineAmount']->value,
										'productNo' => $rs->Fields['ProductNo']->value
					);
					$rs->MoveNext();
					array_push($invoiceDetailAr,$invoiceDetail);
				}
			}
			$rs->Close();

			$data["invoiceHeader"]=$invoiceHeader;
			$data["invoiceDetails"]=$invoiceDetailAr;


			return json_encode($data);
    }


    function takeOrderAction(){
            //use POST. parse json
		    $deviceId= $_GET['deviceId'];

		    if($deviceId ==null ){
			   die('$deviceId is required');
    		}
    		checkDeviceMappingExists($deviceId);
			$requestBody = file_get_contents('php://input');
			$jsonRequest = json_decode($requestBody);
			//var_dump( $jsonRequest);
			//var_dump($jsonRequest->orders);
			//var_dump($jsonRequest->tableDetail);

			$orders = $jsonRequest->orders;
			$tableDetail = $jsonRequest->tableDetail;
			$invoiceNo= $tableDetail->invoiceNo;

    		if($invoiceNo==null){

				$baristaCode = $tableDetail->baristaCode;
				$cafeTableID =  $tableDetail->cafeTableID;
				$barista= $tableDetail->barista;
				$totalQty= $tableDetail->totalQty;
				$totalItems= $tableDetail->totalItems;
				$totalAmount= $tableDetail->totalAmount;
				$guid =create_guid('');

				$nextInvoiceNo = getNextInvoiceNo();
				$invoiceNo = $nextInvoiceNo;
				logi("Take new order request :: deviceId : $deviceId , nextInvoiceNo : $nextInvoiceNo, productNo : $productNo, baristaCode : $baristaCode, cafeTableID: $cafeTableID, barista: $barista, product : $product, otherDesc : $otherDesc, qty: $qty, price : $price , total: $total" );
				$invoiceDateTime = date("m/d/Y h:i:s a", time());
				$insertSql ="insert into SInvoiceHeader(InvoiceNo, InvoiceType, InvoiceDate, InvoiceAmount, TotalQty, SalesMan, UpdateUser, UpdateDate,CancelledInvoice, CafeTableID, POSGUID) values($nextInvoiceNo,'O', Date(), $totalAmount, $totalQty, '$barista', '$deviceId', #$invoiceDateTime#, 1, $cafeTableID, '$guid')";
				executeUpdate($insertSql);

				foreach($orders as $order){

							$productNo= $order->productNo;
							$product= $order->productDesc;
							$other= $order->otherDesc;
							$qty= $order->qty;
							$price = $order->price;
							$total = $order->total;
							$index = $order->index;

							$insertSqlDetail = "insert into SInvoiceDetail(LineNo, InvoiceNo,InvoiceType, ProductDesc,Qty, Price, LineAmount, ProductNo, OtherDesc, LineDisAmt, LineDisPer, FreeQty, MRP,RefNo, RefDate) values($index, $nextInvoiceNo, 'O', '$product', $qty, $price, $total,$productNo,'$other',0,0,0,0, $nextInvoiceNo, #$invoiceDateTime# )";
							executeUpdate($insertSqlDetail);
				}

				//TODO: update SInvoiceHeader total qty and amount
				 echo '{"status": "New order added successfully  : ' . $nextInvoiceNo . '", "id" : "'.$invoiceNo.'"}';
			}else{
				//handle update order in future here!!
			}

		return $invoiceNo;
    }

    function getNextInvoiceNo(){
        $nextInvoiceNoSql = "SELECT max(InvoiceNo)+1 as nextInvoiceNo from SInvoiceHeader";
		$rs= getResultset($nextInvoiceNoSql);
	    $nextInvoiceNo =-1;
		if(!$rs->EOF){
				$nextInvoiceNo =$rs->Fields['nextInvoiceNo']->value;

		}
	    $rs->Close();
	    logi($nextInvoiceNo);
	    return  $nextInvoiceNo;
    }

    function getInvoices(){

    		$deviceId = $_GET['deviceId'];
    		if($deviceId ==null || $deviceId ==''){
    		  die('{"error": "deviceId is required"}');
    		}
			checkDeviceMappingExists($deviceId);
			$requestsAr= array();
			$sql = "SELECT top 100 * FROM ((SInvoiceHeader sih ".
							" left join EmployeeDevice ed on ed.UserName= sih.SalesMan)".
							" left join CafeTable ct on ct.CafeTableID= sih.CafeTableID)".
							" WHERE sih.UpdateUser = '$deviceId'  order by sih.InvoiceNo desc,InvoiceDate desc"; //and ed.DeviceID='$deviceId'
            //echo $sql;
			$rs= getResultset($sql);
			if(!$rs->EOF){
				while (!$rs->EOF){
				    $request1 = array(
										'InvoiceNo' => $rs->Fields['InvoiceNo']->value,
										'InvoiceDate' => (string)$rs->Fields['InvoiceDate']->value,
										'InvoiceAmount' => $rs->Fields['InvoiceAmount']->value,
										'TotalQty' => $rs->Fields['TotalQty']->value,
										'SalesMan' => $rs->Fields['SalesMan']->value,
										'UpdateUser' => $rs->Fields['sih.UpdateUser']->value,
										'CafeTableID' => $rs->Fields['sih.CafeTableID']->value,
										'CafeTableName' => $rs->Fields['CafeTableName']->value
					);
					//print $rs->Fields['sih.InvoiceNo']->value .' - '. $rs->Fields['InvoiceDate']->value . '<br />';
					$rs->MoveNext();
					array_push($requestsAr,$request1);
				}
			}

			$data["invoices"]=$requestsAr;
			$data["invoiceCount"]=$rs->RecordCount();
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

?>


