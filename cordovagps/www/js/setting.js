var KEY_SERVER_URL="serverUrl";
var KEY_DEBUG="debug";
var KEY_CUSTOMER_ID="customerId";
var KEY_GPS_MAX_AGE="gpsMaxAge";
var KEY_GPS_DESIRED_ACCURACY="gpsAccuracy";
var KEY_GPS_DISTANCE_FILTER="gpsDistanceFilter";
var KEY_APP_VERSION="appVersion";
var KEY_AUTOSTART ="autostart";
var KEY_GPS_TURN_ON_AUTOMATIC = "turnGpsOnAutomatically";
var KEY_INTERNET_TURN_ON_AUTOMATIC = "turnInternetOnAutomatically";
var KEY_TASK_SERVER_URL="taskServerUrl";

var DEBUG_URL="http://jsconsole.com/remote.js?FF53D2D5-E2A7-46C9-B9C6-B7F5D5CA8953";

var DEFAULT_SERVER_URL="http://bri8school.in/europa/index.php/Gps";
var DEFAULT_TASK_SERVER_URL="http://jsoft.duckdns.org:8085/jcrm";
var DEFAULT_CUSTOMER_ID="1";
var DEFAULT_DEBUG="false";
var DEFAULT_GPS_MAX_AGE=300; //seconds - configurable
var DEFAULT_DESIRED_ACCURACY = 10; //10=high, 100= medium, 1000 = low - configurable
var DEFAULT_DISTANCE_FILTER = 20; // in meters - configurable
var DEFAULT_AUTOSTART = "true";
var DEFAULT_GPS_TURN_ON_AUTOMATIC = "true";
var DEFAULT_INTERNET_TURN_ON_AUTOMATIC = "true";

var appSetting ={
	setDefaultSettings: function(permStorage) {
		console.log("Called setDefaultSettings()");
		permStorage.setItem(KEY_APP_VERSION, APP_VERSION);
		permStorage.setItem(KEY_SERVER_URL, DEFAULT_SERVER_URL);
		permStorage.setItem(KEY_TASK_SERVER_URL, DEFAULT_TASK_SERVER_URL);
		permStorage.setItem(KEY_DEBUG, DEFAULT_DEBUG);
		permStorage.setItem(KEY_CUSTOMER_ID, DEFAULT_CUSTOMER_ID);
		permStorage.setItem(KEY_GPS_MAX_AGE, ""+DEFAULT_GPS_MAX_AGE);
		permStorage.setItem(KEY_GPS_DESIRED_ACCURACY, ""+DEFAULT_DESIRED_ACCURACY);
		permStorage.setItem(KEY_GPS_DISTANCE_FILTER, ""+DEFAULT_DISTANCE_FILTER);
		permStorage.setItem(KEY_AUTOSTART, DEFAULT_AUTOSTART);
		
		permStorage.setItem(KEY_GPS_TURN_ON_AUTOMATIC, DEFAULT_GPS_TURN_ON_AUTOMATIC);
		permStorage.setItem(KEY_INTERNET_TURN_ON_AUTOMATIC, DEFAULT_INTERNET_TURN_ON_AUTOMATIC);
		
	},
	resetSettingsToDefault: function(permStorage){
		console.log("resetSettings()");
		alert("Reset settings to default");
		var permStorage=window.localStorage;
		appSetting.setDefaultSettings(permStorage);
		appSetting.updateSettingsView(permStorage);
	},
	updateSettingsView: function(permStorage){
		console.log("updateSettingsView()");
		app.serverUrl= permStorage.getItem(KEY_SERVER_URL);
		if(app.serverUrl==null || app.serverUrl ==undefined){
			alert("serverUrl is empty :"+serverUrl);
		}
		app.taskServerUrl= permStorage.getItem(KEY_TASK_SERVER_URL);
		app.CUSTOMER_ID = permStorage.getItem(KEY_CUSTOMER_ID);

		$('#serverUrl').val(app.serverUrl);
		$('#taskServerUrl').val(app.taskServerUrl);
		$('#customerId').val(app.CUSTOMER_ID);

		app.gpsMaxAge = parseInt(permStorage.getItem(KEY_GPS_MAX_AGE));
		app.distanceFilter = permStorage.getItem(KEY_GPS_DISTANCE_FILTER);
		app.gpsDesiredAccuracy = permStorage.getItem(KEY_GPS_DESIRED_ACCURACY);
		$('#gpsMaxAge').val(app.gpsMaxAge);
		$('#gpsDistanceFilter').val(app.distanceFilter);
		$('#gpsAccuracy').val(app.gpsDesiredAccuracy);
		
		var debug = permStorage.getItem(KEY_DEBUG);
		$('#debug').val(debug);
		app.debug = (debug == "true") ? true : false;
		console.log(app.debug+ "debug :  "+ debug +", bool ="+  (debug == "true"));
		
		app.autostart = permStorage.getItem(KEY_AUTOSTART); 
		console.log("autostart : "+app.autostart );
		$('#autostart').val(app.autostart);
		$('#appVersion').html(appVersion);
		
		app.turnGpsOnAutomatically =permStorage.getItem(KEY_GPS_TURN_ON_AUTOMATIC); 
		app.turnInternetOnAutomatically =permStorage.getItem(KEY_INTERNET_TURN_ON_AUTOMATIC); 
		$('#turnGpsOnAutomatically').val(app.turnGpsOnAutomatically);
		$('#turnInternetOnAutomatically').val(app.turnInternetOnAutomatically);
		console.log("turnGpsOnAutomatically : "+app.turnGpsOnAutomatically +", turnInternetOnAutomatically : "+ app.turnInternetOnAutomatically );
		
	},
	saveSettings: function(){
		var permStorage=window.localStorage;
		var serverUrl = $('#serverUrl').val();
		var taskServerUrl = $('#taskServerUrl').val();
		var debug = $('#debug').val();
		var customerId = $('#customerId').val();
		var gpsMaxAge = $('#gpsMaxAge').val();
		var gpsDistanceFilter = $('#gpsDistanceFilter').val();
		var gpsAccuracy = $('#gpsAccuracy').val();
		app.autostart =$("#autostart").val();
		app.turnGpsOnAutomatically = $('#turnGpsOnAutomatically').val();
		app.turnInternetOnAutomatically = $('#turnInternetOnAutomatically').val();
		console.log("Validating settings");
		if( (gpsMaxAge) =="" || (permStorage)=="" || taskServerUrl=="" || (serverUrl)=="" || (customerId)=="" || gpsDistanceFilter=="" || gpsAccuracy =="" ){
			alert("Fields can't be empty");
			return;
		}
		permStorage.setItem(KEY_SERVER_URL, serverUrl);
		permStorage.setItem(KEY_TASK_SERVER_URL, taskServerUrl);
		permStorage.setItem(KEY_DEBUG, debug);
		permStorage.setItem(KEY_CUSTOMER_ID, customerId);
		permStorage.setItem(KEY_GPS_MAX_AGE, gpsMaxAge);
		permStorage.setItem(KEY_GPS_DISTANCE_FILTER, gpsDistanceFilter);
		permStorage.setItem(KEY_GPS_DESIRED_ACCURACY, gpsAccuracy);
		permStorage.setItem(KEY_AUTOSTART, app.autostart);
		
		permStorage.setItem(KEY_GPS_TURN_ON_AUTOMATIC, this.turnGpsOnAutomatically);
		permStorage.setItem(KEY_INTERNET_TURN_ON_AUTOMATIC, this.turnInternetOnAutomatically);
	
		app.serverUrl = serverUrl;
		app.taskServerUrl = taskServerUrl;
		app.distanceFilter = parseInt(gpsDistanceFilter);
		app.gpsDesiredAccuracy = parseInt(gpsAccuracy);
		app.CUSTOMER_ID =customerId;
		app.gpsMaxAge= parseInt(gpsMaxAge);
		app.debug = debug == "true" ? true : false;
		
		navigator.notification.alert("Saved fine. Thanks!", null, app.NAME);
		if(app.debug){
			console.log("Debug is enabled");
			appSetting.includeScript(DEBUG_URL);
		}
		appSetting.updateSettingsView(permStorage);
		console.log("Saved settings");
	},
	includeScript: function(filename){
	   console.log("Including debug script "+filename);
	   var head = document.getElementsByTagName('head')[0];
	   var script = document.createElement('script');
	   script.src = filename;
	   script.type = 'text/javascript';
	   head.appendChild(script)
	} 

};