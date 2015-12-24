<?php
     ob_start();
    include("config.php");
    include("common-db.php");




	if($_POST["action"] =="updateMapping"){
			$userDeviceIdAr = $_POST["userDeviceId"];
			$employeeIDAr = $_POST["employeeID"];
			$i=0;
			foreach ($employeeIDAr as $employeeID) {
			  if($employeeID!=null){
			  		$tokensUserDev = split("-",$userDeviceIdAr[$i]);
			  		//echo $tokensUserDev[1];

			  		$insertSql ="insert into EmployeeDevice values('$employeeID','$tokensUserDev[1]')";
					$result = executeUpdate($insertSql);

					$deleteTempSql ="delete from EmployeeDeviceTemp  where DeviceID='$tokensUserDev[1]'";
					executeUpdate($deleteTempSql);

					//echo $employeeID.$userDeviceIdAr[$i];
			  }
			  $i++;
			}
			header("Refresh:0");
			logi("updateMapping : ".$_SERVER['REQUEST_URI'] );

	}


	$empSql = "SELECT * from SalesPerson";
	$empDeviceSql = "SELECT * from EmployeeDevice";
	$empDeviceTempSql = "SELECT * from EmployeeDeviceTemp";

	$rs= getResultset($empSql);
	$employeeAr= array();

	if(!$rs->EOF){
		while (!$rs->EOF){
			$employee = array(
								'EmployeeID' => $rs->Fields['SalesPersonCode']->value,
								'EmployeeName' => $rs->Fields['SalesPersonname']->value,
								'ContactPhone' => $rs->Fields['ContactPhone']->value
			);
			//print $rs->Fields['EmployeeID']->value .' - '. $rs->Fields['EmployeeName']->value . '<br />';
			$rs->MoveNext();
			array_push($employeeAr,$employee);
		}
	}

	$rs->Close();

	$rs= getResultset($empDeviceSql);
	$employeeDeviceAr= array();
	if(!$rs->EOF){
			while (!$rs->EOF){
				$employeeDevice = array(
									'EmployeeID' => $rs->Fields['UserName']->value,
									'DeviceID' => $rs->Fields['DeviceID']->value
				);
				//print $rs->Fields['EmployeeID']->value .' - '. $rs->Fields['DeviceID']->value . '<br />';
				$rs->MoveNext();
				array_push($employeeDeviceAr,$employeeDevice);
			}
		}

	$rs->Close();

    $rs= getResultset($empDeviceTempSql);
	$employeeDeviceTempAr= array();
	if(!$rs->EOF){
			while (!$rs->EOF){
				$employeeDeviceTemp = array(
									'UserName' => $rs->Fields['UserName']->value,
									'DeviceID' => $rs->Fields['DeviceID']->value
				);
				//print $rs->Fields['UserName']->value .' - '. $rs->Fields['DeviceID']->value . '<br />';
				$rs->MoveNext();
				array_push($employeeDeviceTempAr,$employeeDeviceTemp);
			}
		}

	$rs->Close();

?>

<h1>Employee device mapping for Mobile Request management</h1>

<fieldset>
<b>Employees</b>
  <select id="employee" name="employee">
  <option> Select Employee</option>
  <?php foreach ($employeeAr as $employee) {
  			?>
  			<option value="<?php echo $employee['EmployeeID'];?>"> <?php echo $employee['EmployeeID'];?> - <?php echo $employee['EmployeeName'];?></option>
  		<?php
  		   }
		?>
  </select>
 <b>EmployeeDevice</b>
   <select id="employeeDevice" name="employeeDevice">
    <option> Select EmployeeDevice </option>
    <?php foreach ($employeeDeviceAr as $employeeDevice) {
    			?>
    			<option value="<?php echo $employeeDevice['EmployeeID'];?><?php echo $employee['DeviceID'];?>"> <?php echo $employeeDevice['EmployeeID'];?> - <?php echo $employeeDevice['DeviceID'];?></option>
    		<?php
    		   }
  		?>
  </select>
</fieldset>
<br/>
<fieldset>
  <legend><b>Employee Device Temp</b></legend>
  <form action="EmployeeMapping.php" method="post">
    <input type="hidden" name="action" value="updateMapping"/>
	 <table>
  			<tr>
    				<th>User Name</th>
    				<th>Device ID</th>
    				<th>Employee ID</th>
  			</tr>
  		<?php foreach ($employeeDeviceTempAr as $employeeDeviceTemp) {
  			?>
  			<tr>
  				<td><?php echo $employeeDeviceTemp['UserName'];?></td>
  				<td><?php echo $employeeDeviceTemp['DeviceID'];?></td>
  				<td><input type="hidden" name="userDeviceId[]" value="<?php echo $employeeDeviceTemp['UserName'];?>-<?php echo $employeeDeviceTemp['DeviceID'];?>" />
  				<input type="text" name="employeeID[]"/> </td>
  			</tr>
  		<?php
  		   }

		?>
	</table>
   <input type="submit" name="Save" value="Save Mapping">
</form>

</fieldset>


