
var gps = {

	bgGeo: null,
	GPSWatchId : null,
	gpsErrorCount : 0,
    gpsTimer : null,
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
	configureBackgroundGeo: function(){
		console.log("Configuring BackgroundGeo");
		gps.bgGeo = window.BackgroundGeolocation;

	    //This would be your own callback for Ajax-requests after POSTing background geolocation to your server.
	    var yourAjaxCallback = function(response) {
	        // IMPORTANT:  You must execute the #finish method here to inform the native plugin that you're finished,
	    	console.log("Finished making AJAX call");
	    	gps.bgGeo.finish();
	    };

	    //This callback will be executed every time a geolocation is recorded in the background. Doesnt work on Android
	    var callbackFn = function(location) {
	        console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);
	        // Do your HTTP request here to POST location to your server.
	        yourAjaxCallback.call(this);
	    };

	    var failureFn = function(error) {
	        console.log('BackgroundGeoLocation error '+ error);
	    }
	    
	    var serverUrl= $('#serverUrl').val();
	    var deviceIdStr = device.uuid;
	    var customerIdStr = app.CUSTOMER_ID;

	    // BackgroundGeoLocation is highly configurable.
	    gps.bgGeo.configure(callbackFn, failureFn, {
	        url: serverUrl + "/createGpsLocationBackground", 
	        params: {
				deviceId : deviceIdStr,
				customerId: customerIdStr,
				eventtype: "bGps",
	        },
	        headers: {                                  
	        },
	        desiredAccuracy: app.gpsDesiredAccuracy,
	        locationTimeout : app.gpsMaxAge, //in seconds
	        stationaryRadius: 20,
	        distanceFilter: app.distanceFilter, //in meters
	        notificationTitle: 'SuperGPS2 Background tracking', 
	        notificationText: 'GPS tracker enabled', 
	        activityType: 'AutomotiveNavigation',
	        debug: app.debug, // enable this hear sounds for background-geolocation life-cycle.
	        stopOnTerminate: false //  enable this to clear background location settings when the app terminates
	    });
	},
	start : function() {
		console.log("starting gps")
		gps.getGpsPosition();
		//gps.gpsTimer = setTimeout(gps.getGpsPosition, 1000*60); //get [position every minute in foreground
		//gps.GPSWatchId = navigator.geolocation.watchPosition(gps.onSuccess, gps.onError, gpsOptions);
		gps.configureBackgroundGeo();

	    // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
	    console.log("BackgroundGeoLocation starting[locationTimeout : "+ app.gpsMaxAge + " seconds, desiredAccuracy :"+ app.gpsDesiredAccuracy );
	    gps.bgGeo.start();
		console.log("GPS started " );
	},
	stop : function() {
		//navigator.geolocation.clearWatch(gps.GPSWatchId);
		//window.clearTimeout(gps.gpsTimer);
		if(gps.bgGeo!=null){
			console.log("Background geo location stopping");
			gps.bgGeo.stop();
		}
	    //console.log("Foreground geo location stopped");
		navigator.notification.alert("GPS stopped " , app.NAME);
	},
	restart : function() {
		
		if(gps.bgGeo!=null){
			 console.log("Geo location watcher restarting");
			 gps.bgGeo.stop();
			 gps.configureBackgroundGeo();
			 gps.bgGeo.start();
			 navigator.notification.alert("GPS watcher restarted ",null, app.NAME );
		}
	   
	},
	getGpsPosition: function(){
		var gpsOptions = {
				enableHighAccuracy : app.HIGH_GPS_ACCURACY,
				timeout : 1000 * 60 * 4,
				maximumAge : 0
			};
		window.navigator.geolocation.getCurrentPosition(gps.onSuccess, gps.onError, gpsOptions);
	},
	onSuccess : function(position) {
		// reset error counter
		gpsErrorCount = 0;

		app.position = position;
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;
		displayCityName(latitude.toString(), longitude.toString(), "gpsAddress");
		
		app.submitToServer();

		$('#locationInfo').removeClass("fail").addClass("success");
		$("#currentLocation").html('Lat: ' + latitude.toFixed(3) + ',' + ' Long: ' + longitude.toFixed(3) + '<br/>');
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
