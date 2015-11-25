var KEY_SERVER_URL="serverUrl";
var KEY_DEBUG="debug";
var KEY_CUSTOMER_ID="customerId";
var KEY_GPS_MAX_AGE="gpsMaxAge";
var KEY_GPS_DESIRED_ACCURACY="gpsAccuracy";
var KEY_GPS_DISTANCE_FILTER="gpsDistanceFilter";
var KEY_APP_VERSION="appVersion";
var KEY_AUTOSTART ="autostart";
var KEY_GPS_TURN_ON_AUTOMATIC = "turnGpsOnAutomatically";
var KEY_GPS_TURN_ON_FORCED = "turnGpsOnForced";
var KEY_INTERNET_TURN_ON_AUTOMATIC = "turnInternetOnAutomatically";
var KEY_TASK_SERVER_URL="taskServerUrl";
var KEY_APK_UPDATE_URL="apkUpdateUrl";
var KEY_SETTING_TYPE ="settingType"; 
var KEY_USERNAME ="userName";
var KEY_WORK_HOURS ="workHours";

var DEBUG_URL="http://jsconsole.com/remote.js?FF53D2D5-E2A7-46C9-B9C6-B7F5D5CA8953";

//europa settings
var DEFAULT_SERVER_URL="http://gpstracker.run/europa/index.php"
var DEFAULT_TASK_SERVER_URL="http://europa-mysore.duckdns.org:8085/jcrm";
var DEFAULT_APK_UPDATE_URL="http://gpstracker.run/europa/apk/superGps2-latest.apk"
var DEFAULT_CUSTOMER_ID="1";
var DEFAULT_SUPER_STARTER_APK_UPDATE_URL ="http://gpstracker.run/europa/apk/superStarter-latest.apk";
	
var DEFAULT_DEBUG="false";
var DEFAULT_GPS_MAX_AGE=180; //seconds - configurable
var DEFAULT_DESIRED_ACCURACY = 10; //10=high, 100= medium, 1000 = low - configurable
var DEFAULT_DISTANCE_FILTER = 10; // in meters - configurable
var DEFAULT_AUTOSTART = "true";
var DEFAULT_GPS_TURN_ON_AUTOMATIC = "true";
var DEFAULT_GPS_TURN_ON_FORCED = "true";
var DEFAULT_INTERNET_TURN_ON_AUTOMATIC = "true";
var DEFAULT_SETTING_TYPE ="default";
var DEFAULT_TIMEOUT_SECS=90 * 1000;
var DEFAULT_USERNAME = "NA";
var DEFAULT_WORK_HOURS ="9:00 - 19:30,9:00 - 22:30,9:00 - 22:30,9:00 - 22:30,9:00 - 22:30,9:00 - 22:30,9:00 - 22:30";

var appSetting ={
	setDefaultSettings: function(permStorage) {
		console.log("Called setDefaultSettings()");
		permStorage.setItem(KEY_APP_VERSION, APP_VERSION);
		permStorage.setItem(KEY_SERVER_URL, DEFAULT_SERVER_URL);
		permStorage.setItem(KEY_TASK_SERVER_URL, DEFAULT_TASK_SERVER_URL);
		permStorage.setItem(KEY_APK_UPDATE_URL, DEFAULT_APK_UPDATE_URL);
		
		permStorage.setItem(KEY_DEBUG, DEFAULT_DEBUG);
		permStorage.setItem(KEY_CUSTOMER_ID, DEFAULT_CUSTOMER_ID);
		permStorage.setItem(KEY_GPS_MAX_AGE, ""+DEFAULT_GPS_MAX_AGE);
		permStorage.setItem(KEY_GPS_DESIRED_ACCURACY, ""+DEFAULT_DESIRED_ACCURACY);
		permStorage.setItem(KEY_GPS_DISTANCE_FILTER, ""+DEFAULT_DISTANCE_FILTER);
		permStorage.setItem(KEY_AUTOSTART, DEFAULT_AUTOSTART);
		
		permStorage.setItem(KEY_GPS_TURN_ON_AUTOMATIC, DEFAULT_GPS_TURN_ON_AUTOMATIC);
		permStorage.setItem(KEY_INTERNET_TURN_ON_AUTOMATIC, DEFAULT_INTERNET_TURN_ON_AUTOMATIC);
		permStorage.setItem(KEY_SETTING_TYPE,DEFAULT_SETTING_TYPE);
		permStorage.setItem(KEY_USERNAME,DEFAULT_USERNAME);
		permStorage.setItem(KEY_WORK_HOURS,DEFAULT_WORK_HOURS);
		permStorage.setItem(KEY_GPS_TURN_ON_FORCED,DEFAULT_GPS_TURN_ON_FORCED);
		
		
	},
	resetSettingsToDefault: function(){
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
		app.customerId = permStorage.getItem(KEY_CUSTOMER_ID);
		app.apkUpdateUrl = permStorage.getItem(KEY_APK_UPDATE_URL);

		$('#serverUrl').val(app.serverUrl);
		$('#taskServerUrl').val(app.taskServerUrl);
		$('#apkUpdateUrl').val(app.apkUpdateUrl);
		$('#customerId').val(app.customerId);

		app.gpsMaxAge = parseInt(permStorage.getItem(KEY_GPS_MAX_AGE));
		app.distanceFilter = permStorage.getItem(KEY_GPS_DISTANCE_FILTER);
		app.gpsDesiredAccuracy = permStorage.getItem(KEY_GPS_DESIRED_ACCURACY);
		$('#gpsMaxAge').val(app.gpsMaxAge);
		$('#gpsDistanceFilter').val(app.distanceFilter);
		$('#gpsAccuracy').val(app.gpsDesiredAccuracy);
		
		var debug = permStorage.getItem(KEY_DEBUG);
		$('#debug').val(debug);
		$('#debug').change();
		app.debug = (debug == "true") ? true : false;
		console.log(app.debug+ "debug :  "+ debug +", bool ="+  (debug == "true"));
		
		app.autostart = permStorage.getItem(KEY_AUTOSTART); 
		console.log("autostart : "+app.autostart );
		$('#autostart').val(app.autostart);
		$('#autostart').change();
		var appVersion = permStorage.getItem(KEY_APP_VERSION);
		$('#appVersion').html(appVersion);
		
		app.turnGpsOnAutomatically =permStorage.getItem(KEY_GPS_TURN_ON_AUTOMATIC); 
		app.turnInternetOnAutomatically =permStorage.getItem(KEY_INTERNET_TURN_ON_AUTOMATIC); 
		$('#turnGpsOnAutomatically').val(app.turnGpsOnAutomatically);
		$('#turnGpsOnAutomatically').change();
		$('#turnInternetOnAutomatically').val(app.turnInternetOnAutomatically);
		$('#turnInternetOnAutomatically').change();
		$('#turnGpsOnForced').val(app.turnGpsOnForcefully);
		$('#turnGpsOnForced').change();
		
		console.log("turnGpsOnForced : "+app.turnGpsOnForcefully +", turnGpsOnAutomatically : "+app.turnGpsOnAutomatically +", turnInternetOnAutomatically : "+ app.turnInternetOnAutomatically );
		var settingType =permStorage.getItem(KEY_SETTING_TYPE); 
		$("#settingType").html("("+settingType+")");
		
		app.userName = permStorage.getItem(KEY_USERNAME);
		$("#userName").html(app.userName);
		app.workHours = permStorage.getItem(KEY_WORK_HOURS);
		$("#workHours").html(app.workHours);
		
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
		var apkUpdateUrl = $('#apkUpdateUrl').val();
		console.log("Validating settings");
		if( (gpsMaxAge) =="" || (permStorage)=="" || apkUpdateUrl=="" || taskServerUrl=="" || (serverUrl)=="" || (customerId)=="" || gpsDistanceFilter=="" || gpsAccuracy =="" ){
			alert("Fields can't be empty");
			return;
		}
		app.autostart =$("#autostart").val();
		app.turnGpsOnAutomatically = $('#turnGpsOnAutomatically').val();
		app.turnInternetOnAutomatically = $('#turnInternetOnAutomatically').val();
		app.turnGpsOnForcefully = $('#turnGpsOnForced').val();
		
		permStorage.setItem(KEY_SERVER_URL, serverUrl);
		permStorage.setItem(KEY_TASK_SERVER_URL, taskServerUrl);
		permStorage.setItem(KEY_APK_UPDATE_URL, apkUpdateUrl);
		permStorage.setItem(KEY_DEBUG, debug);
		permStorage.setItem(KEY_CUSTOMER_ID, customerId);
		permStorage.setItem(KEY_GPS_MAX_AGE, gpsMaxAge);
		permStorage.setItem(KEY_GPS_DISTANCE_FILTER, gpsDistanceFilter);
		permStorage.setItem(KEY_GPS_DESIRED_ACCURACY, gpsAccuracy);
		permStorage.setItem(KEY_AUTOSTART, app.autostart);
		
		permStorage.setItem(KEY_GPS_TURN_ON_AUTOMATIC, app.turnGpsOnAutomatically);
		permStorage.setItem(KEY_INTERNET_TURN_ON_AUTOMATIC, app.turnInternetOnAutomatically);
		permStorage.setItem(KEY_GPS_TURN_ON_FORCED,app.turnGpsOnForcefully);
		
		app.serverUrl = serverUrl;
		app.taskServerUrl = taskServerUrl;
		app.apkUpdateUrl = apkUpdateUrl;
		app.distanceFilter = parseInt(gpsDistanceFilter);
		app.gpsDesiredAccuracy = parseInt(gpsAccuracy);
		app.customerId =customerId;
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
	},
	getLatestApp: function(){
		console.log("getLatestApp() "+ app.apkUpdateUrl);
		navigator.app.loadUrl(app.apkUpdateUrl, {openExternal : true});
	},
	getSuperStarterApp: function(){
		console.log("getSuperStarterApp() "+ app.apkUpdateUrl);
		navigator.app.loadUrl(app.apkSuperStarterAppUpdateUrl, {openExternal : true});
		
	},
	getSettingsFromServer: function(){
		   app.showMessage("Getting settings from server");
	       if(app.checkConnection() == false){
	    	   app.showMessage("No internet connection available to load settings");
	    	   return false;
	       }
	       var settingUrlPath=  app.serverUrl + "/Setting/getSettingsJson?customerId="+ app.customerId+"&deviceId="+ device.uuid;
	       console.log("getSettingsFromServer :"+settingUrlPath);
			$.ajax(settingUrlPath, {
				cache: false,
	            contentType : "application/json",
	            type: 'GET',
	            timeout: DEFAULT_TIMEOUT_SECS,
	            success: function(data) {
	            	app.showMessage("Got settings from server sucessfully!");
	            	loadSettingsFromServer(data);
	            },
				error: function (xhr, status, errorThrown) {
					console.log("error status: " + xhr.status);
					console.log("errorThrown: " + errorThrown);
					app.showMessage("error status: " + xhr.status + "<br/>errorThrown: " + errorThrown);
				}
	        });
			return true;
	}
};

function loadSettingsFromServer(json){
	app.showMessage("Got settings from server");
	console.log("loadSettingsFromServer: "+json);
	var permStorage=window.localStorage;
	//"gpsMaxAge":"300","workHours":"","gpsAccuracy":"20","gpsDistanceFilter":"20","locationToggle":"false","debug":"false","autostart":"true","serverUrl":"http:\/\/bri8school.in\/demo\/gps2\/index.php\/Gps"}
	
	permStorage.setItem(KEY_SERVER_URL, json.serverUrl);
	permStorage.setItem(KEY_TASK_SERVER_URL, json.taskServerUrl);
	permStorage.setItem(KEY_APK_UPDATE_URL, json.apkServerUrl);
	
	permStorage.setItem(KEY_DEBUG, json.debug);
	permStorage.setItem(KEY_GPS_MAX_AGE, ""+json.gpsMaxAge);
	permStorage.setItem(KEY_GPS_DESIRED_ACCURACY, ""+json.gpsAccuracy);
	permStorage.setItem(KEY_GPS_DISTANCE_FILTER, ""+json.gpsDistanceFilter);
	permStorage.setItem(KEY_AUTOSTART, json.autostart);
	
	permStorage.setItem(KEY_GPS_TURN_ON_AUTOMATIC, json.autoTurnOnGps);
	permStorage.setItem(KEY_INTERNET_TURN_ON_AUTOMATIC, json.autoTurnOnInternet);
	permStorage.setItem(KEY_SETTING_TYPE,"server");
	permStorage.setItem(KEY_USERNAME, json.userName);
	permStorage.setItem(KEY_WORK_HOURS,json.workHours);
	permStorage.setItem(KEY_GPS_TURN_ON_FORCED,json.turnGpsOnForcefully);
	
	appSetting.updateSettingsView(permStorage);
	alert("Settings retreived from server!");
}
