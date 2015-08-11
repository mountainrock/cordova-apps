
var gps = {
	GPSWatchId : null,
	gpsErrorCount : 0,

	init : function() {
		gps.initToggleListener();
		gps.start();
	},
	initToggleListener : function() {
		$('#locationToggle').bind("change", function(event, ui) {
			if (this.value == "true") {
				alert("GPS starting from button");
				gps.start();
				console.log("GPS started");
			} else {
				gps.stop();
			}
		});
	},
	start : function() {
		console.log("starting gps")
		var gpsOptions = {
			enableHighAccuracy : app.HIGH_GPS_ACCURACY,
			timeout : 1000 * 60 * 4,
			maximumAge : 1 * 1000
		};
		gps.GPSWatchId = navigator.geolocation.watchPosition(gps.onSuccess, gps.onError, gpsOptions);
		//alert("GPS started id: "+ gps.GPSWatchId );
	},
	stop : function() {
		navigator.geolocation.clearWatch(gps.GPSWatchId);
		alert("GPS stopped " );
	},
	onSuccess : function(position) {
		// reset error counter
		gpsErrorCount = 0;

		app.position = position;
		app.submitToServer();

		$('#locationInfo').removeClass("fail").addClass("success");
		elem.innerHTML = ('Latitude: ' + position.coords.latitude.toFixed(3) + '<br/>' + 'Longitude: ' + position.coords.longitude.toFixed(3) + '<br/>');
				//+ 'Last Update: ' + app.getReadableTime(position.timestamp));
	},
	onError : function(error) {
		gps.gpsErrorCount++;

		if (gps.gpsErrorCount > 3) {
			$('#locationInfo').removeClass("success").addClass("fail");
			elem.innerHTML = ('There is an error, restarting GPS. ' + app.getReadableTime(new Date()) + "<br/> message:" + error.message);
			console.log('error with GPS: error.code: ' + error.code + ' Message: ' + error.message);

			// Restart GPS listener, fixes most issues.
			gps.stop();
			gps.start();
		}
	}
};
