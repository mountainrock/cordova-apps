var APP_VERSION="1.3";

var KEY_SERVER_URL="serverUrl";
var KEY_DEBUG="debug";
var KEY_CUSTOMER_ID="customerId";
var KEY_GPS_MAX_AGE="gpsMaxAge";
var KEY_GPS_DESIRED_ACCURACY="gpsAccuracy";
var KEY_GPS_DISTANCE_FILTER="gpsDistanceFilter";
var KEY_APP_VERSION="appVersion";
var KEY_AUTOSTART ="autostart";

var DEBUG_URL="http://jsconsole.com/remote.js?FF53D2D5-E2A7-46C9-B9C6-B7F5D5CA8953";

var DEFAULT_SERVER_URL="http://bri8school.in/europa/index.php/Gps";
var DEFAULT_CUSTOMER_ID="1";
var DEFAULT_DEBUG="false";
var DEFAULT_GPS_MAX_AGE=300; //seconds - configurable
var DEFAULT_DESIRED_ACCURACY = 10; //10=high, 100= medium, 1000 = low - configurable
var DEFAULT_DISTANCE_FILTER = 20; // in meters - configurable
var DEFAULT_AUTOSTART = "true";

var app = {
	CUSTOMER_ID : 1,  //default
	HIGH_GPS_ACCURACY : true,	// some emulators require true.
	NAME : "GPS Tracker",
	position : null,
	deviceId : "",
	passcode : 0,
	timeLastSubmit : 0,
	gpsMaxAge : DEFAULT_GPS_MAX_AGE,
	gpsDesiredAccuracy : DEFAULT_DESIRED_ACCURACY,
	distanceFilter : DEFAULT_DISTANCE_FILTER,
	forcedSubmit : false, // set if user explicitly presses submit button.
    debug : false,
    autostart : true,
	// Application Constructor
	initialize : function() {
		console.log("initialize() - bindEvents()");
		this.bindEvents();
		console.log("initFastClick()");
		this.initFastClick();
		console.log("initView()");
		this.initView();
		app.timeLastSubmit = (new Date().getTime() / 1000) - 60; 
		
		//include debug 
		var permStorage=window.localStorage;
		this.debug = permStorage.getItem(KEY_DEBUG);
		console.log("initialize() completes");
	},
	onDeviceReady : function() {
		console.log("onDeviceReady called");
		navigator.splashscreen.hide();
		console.log("check net connection");
		app.checkConnection();
		console.log("check location");
		app.checkLocation();
		console.log("gps init()");
		gps.init();
		
		console.log("device id "+device.uuid);
		window.localStorage.setItem("deviceId", device.uuid);
		this.deviceId = device.uuid;
		$('#deviceId').text(this.deviceId);
		
		console.log("Initializing background geo location");
		
	    console.log("Initializing BackgroundGeo");
	    gps.start(); 
	    // Your app must execute AT LEAST ONE call for the current position via standard Cordova geolocation,
	    //  in order to prompt the user for Location permission.
	    window.navigator.geolocation.getCurrentPosition(function(location) {
	        console.log('Location from cordova current position : '+ location);
	    });
	    if(app.checkConnection()){
	    	if(this.debug!=null && this.debug=="true"){
				includeScript(DEBUG_URL);
			}
	    	console.log("loadRoutesIntoDropdownBox");
	    	loadRoutesIntoDropdownBox(); //maps
	    }
		
	    app.autostartup();
	    console.log("onDeviceReady() completes");

	},
	bindEvents : function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	
	initFastClick : function() {
		window.addEventListener('load', function() {
			FastClick.attach(document.body);
		}, false);
	},
	initView : function() {
			console.log("Initializing view");
			$('#historyPage').hide();
			$('#settingsPage').hide();
			$('#statusPage').show();
			var permStorage=window.localStorage;
			var appVersion = permStorage.getItem(KEY_APP_VERSION);
			
			if(appVersion ==null || appVersion != APP_VERSION){//init defaults
				alert("NOTE : Application settings not configured for app version "+APP_VERSION+". Using defaults!");
				permStorage.setItem(KEY_APP_VERSION, APP_VERSION);
				permStorage.setItem(KEY_SERVER_URL, DEFAULT_SERVER_URL);
				permStorage.setItem(KEY_DEBUG, DEFAULT_DEBUG);
				permStorage.setItem(KEY_CUSTOMER_ID, DEFAULT_CUSTOMER_ID);
				permStorage.setItem(KEY_GPS_MAX_AGE, ""+DEFAULT_GPS_MAX_AGE);
				permStorage.setItem(KEY_GPS_DESIRED_ACCURACY, ""+DEFAULT_DESIRED_ACCURACY);
				permStorage.setItem(KEY_GPS_DISTANCE_FILTER, ""+DEFAULT_DISTANCE_FILTER);
				permStorage.setItem(KEY_AUTOSTART, DEFAULT_AUTOSTART);
				
				appVersion = permStorage.getItem(KEY_APP_VERSION);
				console.log("Saved default values");
			}
				
			$('#serverUrl').val( permStorage.getItem(KEY_SERVER_URL));
			
			var customerId = permStorage.getItem(KEY_CUSTOMER_ID);
			$('#customerId').val(customerId);
			this.CUSTOMER_ID = customerId;

			this.gpsMaxAge = parseInt(permStorage.getItem(KEY_GPS_MAX_AGE));
			$('#gpsMaxAge').val(this.gpsMaxAge);

			this.distanceFilter = permStorage.getItem(KEY_GPS_DISTANCE_FILTER);
			this.gpsDesiredAccuracy = permStorage.getItem(KEY_GPS_DESIRED_ACCURACY);
			$('#gpsDistanceFilter').val(this.distanceFilter);
			$('#gpsAccuracy').val(this.gpsDesiredAccuracy);
			
			var debug = permStorage.getItem(KEY_DEBUG);
			$('#debug').val(debug);
			app.debug = (debug == "true") ? true : false;
			console.log(app.debug+ "debug :  "+ debug +", bool ="+  (debug == "true"));
			
			this.autostart = permStorage.getItem(KEY_AUTOSTART); 
			console.log("autostart : "+this.autostart );
			$('#autostart').val(this.autostart);
			$('#appVersion').html(appVersion);
			
	},
	checkConnection : function() {
		var networkState = navigator.connection.type;

		var states = {};
		states[Connection.UNKNOWN] = 'Unknown';
		states[Connection.ETHERNET] = 'Ethernet';
		states[Connection.WIFI] = 'WiFi';
		states[Connection.CELL_2G] = 'Cell 2G';
		states[Connection.CELL_3G] = 'Cell 3G';
		states[Connection.CELL_4G] = 'Cell 4G';
		states[Connection.CELL] = 'Cell';
		states[Connection.NONE] = 'No';

		elem = $('#connectionInfo');
		var isConnected=true;
		if (networkState == Connection.NONE) {
			isConnected = false;
			this.failElement(elem);
		} else {
			this.succeedElement(elem);
		}
		$('#connectionInfo').html( 'Internet: ' + states[networkState]);
		
		return isConnected;
	},
	checkLocation: function(){
		//check location
		cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
			if(enabled==false){
				alert("Location is disabled! Please switch it on");
				cordova.plugins.diagnostic.switchToLocationSettings();
			}
		}, function(error){
			navigator.notification.alert("The following error occurred: "+error,null, app.NAME);
		});
	},
	getReadableTime : function(time) {
		var hours = time.getHours();
		var ampm = hours >= 12 ? 'pm' : 'am';
		hours = hours % 12;
		hours = hours ? hours : 12;

		return (hours + ':' + app.padZero(time.getMinutes()) + ':'
				+ app.padZero(time.getSeconds()) + ' ' + ampm);
	},
	padZero : function(num) {
		return (num < 10 ? '0' + num : num);
	},
	succeedElement : function(elem) {
		elem.removeClass("fail");
		elem.addClass("success");
	},
	failElement : function(elem) {
		elem.removeClass("success");
		elem.addClass("fail");
	},
	autostartup : function(){
		if(app.autostart=="true"){
	    	console.log("autostart is enabled");
	    	cordova.plugins.autoStart.enable();
	    }else{
	    	console.log("autostart is disabled");
	    	cordova.plugins.autoStart.disable();
	    }
	}
};
$(function() {

	$("#submit-passcode").click(function() {
		app.forcedSubmit = true; // forces pop-up
		gps.getGpsPosition();
		app.submitToServer();
	});
	
	$("#saveSettings").click(function() {
		console.log("Saving settings");
		 //save settings
		var permStorage=window.localStorage;
		var serverUrl = $('#serverUrl').val();
		var debug = $('#debug').val();
		var customerId = $('#customerId').val();
		var gpsMaxAge = $('#gpsMaxAge').val();
		var gpsDistanceFilter = $('#gpsDistanceFilter').val();
		var gpsAccuracy = $('#gpsAccuracy').val();
		var appAutostart =$("#autostart").val();
		
		if( (gpsMaxAge) =="" || (permStorage)=="" || (serverUrl)=="" || (customerId)=="" || gpsDistanceFilter=="" || gpsAccuracy =="" ){
			alert("Fields can't be empty");
			return;
		}
		permStorage.setItem(KEY_SERVER_URL, serverUrl);
		permStorage.setItem(KEY_DEBUG, debug);
		permStorage.setItem(KEY_CUSTOMER_ID, customerId);
		permStorage.setItem(KEY_GPS_MAX_AGE, gpsMaxAge);
		permStorage.setItem(KEY_GPS_DISTANCE_FILTER, gpsDistanceFilter);
		permStorage.setItem(KEY_GPS_DESIRED_ACCURACY, gpsAccuracy);
		permStorage.setItem(KEY_AUTOSTART, appAutostart);
	
		this.distanceFilter = parseInt(gpsDistanceFilter);
		this.gpsDesiredAccuracy = parseInt(gpsAccuracy);
		this.CUSTOMER_ID =customerId;
		this.gpsMaxAge= parseInt(gpsMaxAge);
		app.debug = debug == "true" ? true : false;
		
		navigator.notification.alert("Saved fine. Thanks!", null, app.NAME);
		if(app.debug){
			includeScript(DEBUG_URL);
		}
		gps.restart();
		
		this.autostart = appAutostart; 
		app.autostartup();
	});

	$(document).delegate('.ui-navbar a', 'click', function() {
		$(this).addClass('ui-btn-active');
		$('.content_div').hide();
		$('#' + $(this).attr('data-href')).show();
	});
	
});

function includeScript(filename)
{
   console.log("Including debug script "+filename);
   var head = document.getElementsByTagName('head')[0];
   var script = document.createElement('script');
   script.src = filename;
   script.type = 'text/javascript';
   head.appendChild(script)
} 