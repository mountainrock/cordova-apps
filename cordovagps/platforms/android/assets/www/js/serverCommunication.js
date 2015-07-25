
app.submitToServer = function() {
	var username = document.getElementById('userName').value;
    var distance=0;
    var locationmethod="NA";
    var phonenumber ="gpsTracker1";
    var sessionid = (new Date()).toDateString();
    var eventtype="gGps tracker";
    var date1 = (new Date()).toISOString().replace(/z|t/gi,' ').substr(0, 19);

    if(app.position!=undefined && app.position!=null){
    	 var accuracy= app.position.coords.accuracy;
    	 var extrainfo ="time : "+app.position.timestamp;
    	    
		if (((new Date().getTime() / 1000) - app.timeLastSubmit) > 59
				|| app.forcedSubmit) {
			app.timeLastSubmit = new Date().getTime() / 1000;
			app.checkConnection();

			$.ajax(app.SERVER_URL, {
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
					"date": date1
					
				},
				timeout : 10000,
				success : function(response) {
					app.serverSuccess(response);
				},
				error : function(request, errorType, errorMessage) {
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
	navigator.notification.alert("No position available to submit.", null,
							"GPS Tracker");
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
					.alert(
							"Not authorized. Your device id is: "
									+ app.deviceId, null,
							"GPS Tracker");
		}
		$(serverResponse).removeClass("success");
		$(serverResponse).addClass("fail");
	} else {
		if (app.forcedSubmit) {
			navigator.notification.alert("Success. Thank you!" + serverResponse, null,
					"gps Tracker");
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
	serverError.innerHTML = "Error: " + errorMessage + " "
			+ app.getReadableTime(new Date());
	if (app.forcedSubmit) {
		navigator.notification.alert(
				"Error, please check your internet connection", null,
				"GPS Tracker");
		app.forcedSubmit = false;
	}
};
