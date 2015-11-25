var APP_VERSION="2.0";
var IS_TASK_ENABLED=true;

var app = {
	customerId : DEFAULT_CUSTOMER_ID,  //default
	HIGH_GPS_ACCURACY : true,	// some emulators require true.
	NAME : "GPS Tracker",
	userName : null,
	workHours : DEFAULT_WORK_HOURS,
	serverUrl: DEFAULT_SERVER_URL,
	taskServerUrl : DEFAULT_TASK_SERVER_URL,
	apkUpdateUrl: DEFAULT_APK_UPDATE_URL,
	apkSuperStarterAppUpdateUrl : DEFAULT_SUPER_STARTER_APK_UPDATE_URL,
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
    turnGpsOnAutomatically : DEFAULT_GPS_TURN_ON_AUTOMATIC,
    turnGpsOnForcefully :DEFAULT_GPS_TURN_ON_FORCED,
    turnInternetOnAutomatically : DEFAULT_INTERNET_TURN_ON_AUTOMATIC,
	// Application Constructor
	initialize : function() {
		console.log("initialize() - bindEvents()");
		this.bindEvents();
		console.log("initFastClick()");
		this.initFastClick();
		app.timeLastSubmit = (new Date().getTime() / 1000) - 60; 
		
		console.log("initialize() completes");
	},
	onDeviceReady : function() {
		console.log("onDeviceReady called");
		//jQuery.mobile.changePage(jQuery('#taskPage'));
		
		console.log("check net connection");
		app.checkConnection();
		console.log("check location");
		app.checkLocation();
		console.log("initView()");
		app.initView();
		console.log("gps init()");
		gps.init();
		
		console.log("device id "+device.uuid);
		window.localStorage.setItem("deviceId", device.uuid);
		this.deviceId = device.uuid;
		$('#deviceId').text(this.deviceId);
		
		if(IS_TASK_ENABLED ==true){
			console.log("Loading tasks");
			task.getTasks();
		}
		    
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
	    	//console.log("loadRoutesIntoDropdownBox");
	    	//loadRoutesIntoDropdownBox(); //maps
	    }
		
	    app.autostartup();
	    navigator.splashscreen.hide();
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
			$('#taskDetailsPage').hide();
			if(IS_TASK_ENABLED ==true){
				$('#taskPage').show();
			}else{
				$('#taskPage').hide();
				//$('#taskButton').hide();
				$('#privacyPage').show();
			}
			
			var permStorage=window.localStorage;
			var appVersion = permStorage.getItem(KEY_APP_VERSION);
			
			if(appVersion ==null || appVersion==undefined || APP_VERSION!=appVersion ){//init defaults
				alert("NOTE : Application settings not configured for app version "+APP_VERSION+". Using defaults!");
				appSetting.setDefaultSettings(permStorage);
				appSetting.getSettingsFromServer();
				appVersion = permStorage.getItem(KEY_APP_VERSION);
				console.log("Saved default values for version : "+ appVersion);
			}else{
				console.log("Using settings for version : "+ appVersion);
			}
			appSetting.updateSettingsView(permStorage);
			
	},
	checkConnection : function() {
		if(navigator.connection==null || navigator.connection==undefined){
			console.log("navigator undefined to check connection");
			return;
		}
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
			/*alert("Please switch on internet");
			cordova.plugins.diagnostic.switchToMobileDataSettings();*/
		} else {
			this.succeedElement(elem);
		}
		$('#connectionInfo').html( 'Internet: ' + states[networkState]);
		
		return isConnected;
	},
	checkLocation: function(){
		//check location
		//alert(app.turnGpsOnForcefully);
		if(app.turnGpsOnForcefully =="true"){
			cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
				if(enabled==false){
					 alert("Please switch on GPS location");
					 setTimeout(app.submitGpsNotTurnedOn,2000);
					cordova.plugins.diagnostic.switchToLocationSettings();
				}
			}, function(error){
				navigator.notification.alert("The following error occurred: "+error,null, app.NAME);
			});
		}
		
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
	},
	showMessage: function(str){
		console.log(str);
		var date1 =(new Date()).format("DD/MM HH:m:s");
		 $("#statusMessage").html(date1 + " : "+ str );
		 $("#statusMessage").show();
	}
};
$(function() {

	$("#submit-passcode").click(function(e) {
		e.preventDefault();
		app.forcedSubmit = true; // forces pop-up
		app.checkLocation();
		gps.getGpsPosition();
	});
	$("#showTaskDetails").click(function() {
		app.checkLocation();
		task.showTaskDetails();
	});
	$("#reloadTasks").click(function() {
		app.checkLocation();
		task.getTasks();
	});
	$("#autoRefreshTask").click(function() {
		if($("#autoRefreshTask .ui-btn-text").text()=="Auto Refresh Off"){
			$("#autoRefreshTask .ui-btn-text").text("Auto Refresh On");
			task.restartInterval();
		}else{
			$("#autoRefreshTask .ui-btn-text").text("Auto Refresh Off");
			task.stopAutoRefresh();
		}
	});
	$("#checkForUpdateApp").click(function(){
		appSetting.getLatestApp();
	});
	
	$("#downloadSuperStarterApp").click(function(){
		appSetting.getSuperStarterApp();
	});
	
	$("#historyButton").click(function() {
		loadRoutesIntoDropdownBox();
	});
	
	$("#resetSettingsToDefault").click(function() {
		console.log("resetSettingsToDefault");
		appSetting.resetSettingsToDefault();
		gps.restart();
		app.autostartup();
	});
	$("#getServerSettings").click(function() {
		console.log("getServerSettings");
		appSetting.getSettingsFromServer();
		gps.restart();
		app.autostartup();
	});
	
	$("#saveSettings").click(function() {
		console.log("Saving settings");
		 //save settings
		appSetting.saveSettings();
		gps.restart();
		app.autostartup();
	});

	$(document).delegate('.ui-navbar a', 'click', function() {
		$(this).addClass('ui-btn-active');
		$('.content_div').hide();
		$('#' + $(this).attr('data-href')).show();
	});
	
	
});

