var task ={
	showTaskDetails: function() {
		jQuery.mobile.changePage(jQuery('#taskDetailsPage'));
	},
	getTasks : function() {  
	       var isConnected = app.checkConnection();
	       if(isConnected == false){
	    	   alert("No internet connection available to load tasks");
	    	   return;
	       }
	       //var taskUrlPath=  app.taskServerUrl + "Requests.php?action=getRequests&deviceId="+ device.uuid;
	       var taskUrlPath=  app.taskServerUrl + "/Requests.php?action=getRequests&employeeId=1";
	       console.log("getTasks :"+taskUrlPath);
			$.ajax({
	            url: taskUrlPath,
	            type: 'GET',
				jsonpCallback :"loadTasks",			
	            dataType: 'jsonp',
	            success: function(data) {
	                console.log("loadTasks: "+data); //should call loadRoutes() callback
				},
				error: function (xhr, status, errorThrown) {
					console.log("error status: " + xhr.status);
					console.log("errorThrown: " + errorThrown);
				}
	        });		
	   }    


};

function loadTasks(json) { 
  //alert(json);
  $("#taskTable tr.task").remove();
  $(json.requests).each(function(key, value){
	  var taskId = $(this).attr('RequestID');
      var row = "<tr class='task'>"+ 
      					td(this,'RequestID') +
      					td(this,'CustomerName') + 
      					td(this,'Address') +
      					td(this,'AreaName') +
      					td(this,'Status') +
      					'<td><a <a href="#" id="updateTask" onclick ="updateTask('+taskId+')" data-role="button" data-inline="true" data-theme="e" data-icon="check">Update</a></td>'
      			"</tr>";
      $("#taskTable").append(row);
  });
}

function updateTask(taskId){
	$("#taskId").val(taskId);
	navigator.notification.confirm("Confirm task status", confirmUpdateTask, "Confirm Task", "Complete,Hold,Cancel");
	
}

function confirmUpdateTask(buttonIndex){
	alert('You selected button ' + buttonIndex);
}

function td(obj, attrId){
	var str = $(obj).attr(attrId);
	return "<td>"+str+"</td>";
}