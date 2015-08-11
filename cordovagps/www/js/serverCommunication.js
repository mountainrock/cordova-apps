
app.submitToServer = function() {
	var username = "NA";
    var distance=0;
    var locationmethod="NA";
    var phonenumber ="";
    var sessionid = (new Date()).toDateString();
    var eventtype="Gps";
    var date1 = (new Date()).format("YYYY-MM-DD HH:m:s");
    var serverUrl= $('#serverUrl').val();

    if(app.position!=undefined && app.position!=null){
    	 var accuracy= app.position.coords.accuracy;
    	 var extrainfo ="time : "+app.position.timestamp;
    	    
		if (((new Date().getTime() / 1000) - app.timeLastSubmit) > 59 || app.forcedSubmit) {
			app.timeLastSubmit = new Date().getTime() / 1000;
			var isConnected = app.checkConnection();
			if(isConnected == false){
				navigator.notification.alert("No internet : lat : "+app.position.coords.latitude +" , Long :"+ app.position.coords.longitude,null, app.NAME);
				app.checkLocation();
				return;
			}
			var createGpsLocUrl = serverUrl + "/createGpsLocation";
			$.ajax(createGpsLocUrl, {
				contentType : "application/json",
				type : "GET",
				data : {
					"username" : username,
					"latitude"  : app.position.coords.latitude,
					"longitude" : app.position.coords.longitude,
					"speed" 	: app.position.coords.speed,
					"direction" : app.position.coords.heading,
					"distance": distance,
					"locationmethod": locationmethod,
					"phonenumber": phonenumber,
					"sessionid": sessionid,
					"accuracy": accuracy,
					"extrainfo": extrainfo,
					"eventtype": eventtype,
					"date": date1,
					"deviceId":device.uuid,
					"customerId": app.CUSTOMER_ID
					
					
				},
				timeout : 20000,
				success : function(response) {
					app.serverSuccess(response);
				},
				error : function(request, errorType, errorMessage) {
					navigator.notification.alert("Failed to submit on internet : lat : "+app.position.coords.latitude +" , Long :"+ app.position.coords.longitude, null, app.NAME);
					app.serverError(request, errorType, errorMessage);
				}
			});
		} 
		else {
			console.log('too soon');
			// Too Soon: commented out because not useful for user and confusing.
			// var serverError = document.getElementById('serverResponse');
			// serverError.innerHTML = "Too soon: "+app.getReadableTime( new Date())
			// ;
		}		
	}
	else{
		app.checkLocation();
		navigator.notification.alert("No position available to submit.", null, app.NAME);
	}
};

app.serverSuccess = function(response) {
	console.log("response from server : "+ response);
	
	var responseObj = response; //jQuery.parseJSON(response);
	var serverResponse = document.getElementById('serverResponse');
	serverResponse.innerHTML = "auto-submit: " + responseObj + ": " + app.getReadableTime(new Date());

	if (responseObj == "not authorized") {
		if (app.forcedSubmit) {
			app.forcedSubmit = false;
			navigator.notification
					.alert("Not authorized. Your device id is: "+ app.deviceId, null, app.NAME);
		}
		$(serverResponse).removeClass("success");
		$(serverResponse).addClass("fail");
	} else {
		if (app.forcedSubmit) {
			navigator.notification.alert("Success. Thank you!", null, app.NAME);
			app.forcedSubmit = false;
		}
		$(serverResponse).removeClass("fail");
		$(serverResponse).addClass("success");

	}

};

app.serverError = function(request, errorType, errorMessage) {
	var serverError = document.getElementById('serverResponse');
	$(serverError).removeClass("success");
	$(serverError).addClass("fail");
	serverError.innerHTML = "Error: " + errorMessage + " " + app.getReadableTime(new Date());
	if (app.forcedSubmit) {
		navigator.notification.alert(
				"Error, please check your internet connection", null,
				app.NAME);
		app.forcedSubmit = false;
	}
};
