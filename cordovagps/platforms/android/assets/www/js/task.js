var task ={
    intervalID : null,
	showTaskDetails: function() {
		//jQuery.mobile.changePage(jQuery('#taskDetailsPage'));
	},
	getTasks : function() {  
		   app.showMessage("Getting tasks. Please wait...");
	       var isConnected = app.checkConnection();
	       if(isConnected == false){
	    	   app.showMessage("No internet connection available to load tasks");
	    	   return;
	       }
	       var taskUrlPath=  app.taskServerUrl + "/Requests.php?action=getRequests&deviceId="+ device.uuid;
	       app.showMessage("getTasks :"+taskUrlPath);
			$.ajax(taskUrlPath, {
				cache: false,
	            contentType : "application/json",
	            type: 'GET',
	            timeout: DEFAULT_TIMEOUT_SECS,
	            success: function(data) {
	            	app.showMessage("Loadind tasks --"+ data); //should call loadTasks() callback
	            	loadTasks(data);
	            },
				error: function (xhr, status, errorThrown) {
					console.log("error status: " + xhr.status);
					console.log("errorThrown: " + errorThrown);
					var errmsg = "";
					if(errorThrown!=null && errorThrown!=undefined){
						errmsg =errorThrown.message;
					}
					app.showMessage("Error xhr.status: " + xhr.status+", status :"+ status + "<br/>errorThrown: " + errmsg);
				}
	        });		
	   },
	  stopAutoRefresh: function(){
		  clearInterval(task.intervalID);
	  },
	  restartInterval: function() {
	        clearInterval(task.intervalID);
	        task.intervalID = setInterval(task.getTasks, 60 * 1000);          
	   },
	  updateTask: function(taskId){
			$("#taskId").val(taskId);
			navigator.notification.confirm("Confirm task status for Id :"+ taskId, task.confirmUpdateTask, "Confirm Task", ["Complete","Hold","Cancel"]);
			
		},
	 confirmUpdateTask: function(buttonIndex){
			console.log('You selected button ' + buttonIndex);
			 var taskId = $("#taskId").val();
			 var statusId =null;
			 if(buttonIndex==1){ //complete
				 statusId = 2;
			 }else if(buttonIndex==2){ //hold
				 statusId = 4;
			 }else{ //cancel
				 return;
			 }
			
			 var isConnected = app.checkConnection();
		     if(isConnected == false){
		       app.showMessage("No internet connection available to update task");
		  	   return;
		     }
		     var taskUpdateUrlPath= app.taskServerUrl + "/Requests.php?action=updateStatus&deviceId="+ device.uuid +"&requestId="+ taskId + "&statusId="+ statusId;
		     console.log("updateTask :"+taskUpdateUrlPath);
				$.ajax(taskUpdateUrlPath,
						{
							contentType : "application/json",
				            type: 'GET',
				            timeout: DEFAULT_TIMEOUT_SECS,
				            success: function(data) {
				              app.showMessage("updated task status: "+data); //should call loadRoutes() callback
				              updateTaskResponse(data);
				            },
							error: function (xhr, status, errorThrown) {
								console.log("error status: " + xhr.status);
								console.log("errorThrown: " + errorThrown);
								app.showMessage("error status: " + xhr.status + "<br/>errorThrown: " + errorThrown);
							}
		      });		
				
		}


};

function loadTasks(json) { 
  //alert(json);
  $("#taskTable tr.task").remove();
  var i=0;
  if(json==null || json.recordCount ==0){
	  app.showMessage("No tasks found");
	  return;
  }
 
  app.showMessage("Loading tasks");
  $(json.requests).each(function(key, value){
	  var taskId = $(this).attr('RequestID');
	  var phoneNo = $(this).attr('ContactNo');
	  var row = "";
	  if(i++%2==0){
		  row ="<tr class='task oddRow'>";
	  }else{
		  row ="<tr class='task'>";
	  }
      row = row	+ 
				td(this,'RequestID') +
				"<td valign='top'>"+$(this).attr('CustomerName') + " <br/> <a href='tel:" + phoneNo + "'>"+ phoneNo+ "</a></td>"+ 
				"<td valign='top'>"+$(this).attr('Address') + " <br/> "+ $(this).attr('AreaName')+ "</td>"+
				'<td valign="top"><a <a href="#" id="updateTask" class="updateTask" onclick ="task.updateTask('+taskId+')" data-role="button" data-inline="true" data-theme="e" data-icon="check"><b>Update</b></a></td>'
			 "</tr>";
      $("#taskTable").append(row);
      $(".updateTask").change();
  });
  
  app.showMessage("Found "+ json.recordCount + " task(s) ");
}


function updateTaskResponse(json){
	app.showMessage("Updated! Server response : "+ json.status);
	task.getTasks();
}

function td(obj, attrId){
	var str = $(obj).attr(attrId);
	return "<td valign='top'>"+str+"</td>";
}