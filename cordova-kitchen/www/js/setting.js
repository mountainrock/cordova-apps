var KEY_SERVER_URL="serverUrl";
var KEY_DEBUG="debug";
var KEY_CUSTOMER_ID="customerId";
var KEY_APP_VERSION="appVersion";
var KEY_AUTOSTART ="autostart";
var KEY_TASK_SERVER_URL="taskServerUrl";
var KEY_APK_UPDATE_URL="apkUpdateUrl";
var KEY_SETTING_TYPE ="settingType"; 
var KEY_USERNAME ="userName";

//europa settings
var DEFAULT_SERVER_URL="http://bri8school.in/demo/kos/index.php"
var DEFAULT_TASK_SERVER_URL="http://192.168.1.100:90/cafe/";
var DEFAULT_APK_UPDATE_URL="http://bri8school.in/demo/kos/apk/kos-latest.apk"
var DEFAULT_CUSTOMER_ID="1";
	
var DEFAULT_DEBUG="false";
var DEFAULT_DESIRED_ACCURACY = 10; //10=high, 100= medium, 1000 = low - configurable
var DEFAULT_DISTANCE_FILTER = 10; // in meters - configurable
var DEFAULT_AUTOSTART = "true";
var DEFAULT_INTERNET_TURN_ON_AUTOMATIC = "true";
var DEFAULT_SETTING_TYPE ="default";
var DEFAULT_TIMEOUT_SECS=90 * 1000;
var DEFAULT_USERNAME = "NA";

var appSetting ={
	setDefaultSettings: function(permStorage) {
		console.log("Called setDefaultSettings()");
		permStorage.setItem(KEY_APP_VERSION, APP_VERSION);
		permStorage.setItem(KEY_SERVER_URL, DEFAULT_SERVER_URL);
		permStorage.setItem(KEY_TASK_SERVER_URL, DEFAULT_TASK_SERVER_URL);
		permStorage.setItem(KEY_APK_UPDATE_URL, DEFAULT_APK_UPDATE_URL);
		
		permStorage.setItem(KEY_DEBUG, DEFAULT_DEBUG);
		permStorage.setItem(KEY_CUSTOMER_ID, DEFAULT_CUSTOMER_ID);
		permStorage.setItem(KEY_USERNAME,DEFAULT_USERNAME);
		
		
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

			
		var debug = permStorage.getItem(KEY_DEBUG);
		$('#debug').val(debug);
		$('#debug').change();
		app.debug = (debug == "true") ? true : false;
		console.log(app.debug+ "debug :  "+ debug +", bool ="+  (debug == "true"));
		
			var appVersion = permStorage.getItem(KEY_APP_VERSION);
		$('#appVersion').html(appVersion);
		
		
		app.userName = permStorage.getItem(KEY_USERNAME);
		$("#userName").html(app.userName);
		
	},
	saveSettings: function(){
		var permStorage=window.localStorage;
		var serverUrl = $('#serverUrl').val();
		var taskServerUrl = $('#taskServerUrl').val();
		var debug = $('#debug').val();
		var customerId = $('#customerId').val();
		var apkUpdateUrl = $('#apkUpdateUrl').val();
		console.log("Validating settings");
		if(  (permStorage)=="" || apkUpdateUrl=="" || taskServerUrl=="" || (serverUrl)=="" ){
			alert("Fields can't be empty");
			return;
		}
		
		permStorage.setItem(KEY_SERVER_URL, serverUrl);
		permStorage.setItem(KEY_TASK_SERVER_URL, taskServerUrl);
		permStorage.setItem(KEY_APK_UPDATE_URL, apkUpdateUrl);
		permStorage.setItem(KEY_DEBUG, debug);
		permStorage.setItem(KEY_CUSTOMER_ID, customerId);
	

		app.serverUrl = serverUrl;
		app.taskServerUrl = taskServerUrl;
		app.apkUpdateUrl = apkUpdateUrl;
		app.customerId =customerId;
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
	
	permStorage.setItem(KEY_SERVER_URL, json.serverUrl);
	permStorage.setItem(KEY_TASK_SERVER_URL, json.taskServerUrl);
	permStorage.setItem(KEY_APK_UPDATE_URL, json.apkServerUrl);
	
	permStorage.setItem(KEY_DEBUG, json.debug);
	
	permStorage.setItem(KEY_SETTING_TYPE,"server");
	permStorage.setItem(KEY_USERNAME, json.userName);
	
	appSetting.updateSettingsView(permStorage);
	alert("Settings retreived from server!");
}
