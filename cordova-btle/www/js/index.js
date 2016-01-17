var APP_VERSION="1.31";
if(window.location!=null && window.location.hostname=="localhost"){
	var device,navigator;
}
var app = {
	customerId : DEFAULT_CUSTOMER_ID,  //default
	NAME : "Kitchen Order",
	userName : "--",
	serverUrl: DEFAULT_SERVER_URL,
	taskServerUrl : DEFAULT_TASK_SERVER_URL,
	apkUpdateUrl: DEFAULT_APK_UPDATE_URL,
	licenseKey : DEFAULT_LICENSE,
	isLicenseValid : false,
	deviceId : "",
    debug : false,
  	// Application Constructor
	initialize : function() {
		console.log("initialize() - bindEvents()");
		this.bindEvents();
		console.log("initFastClick()");
		this.initFastClick();

		console.log("initialize() completes");

		// TODO: this is required only for browser testing and not on device. This is required to work with local browser for development
		if(window.location!=null && window.location.hostname=="localhost"){
			device = new Object();
			device.uuid= '92f51e498f121ea2';
			navigator = new Object();
			navigator.splashscreen  = {hide : function(){
												$(this).hide();
											 }
										};
			app.onDeviceReady();
			taskServerUrl = "http://localhost:90/cafe/";
	    }

	},
	onDeviceReady : function() {
		console.log("onDeviceReady called");
		//jQuery.mobile.changePage(jQuery('#taskPage'));

		console.log("initView()");
		app.initView();

		console.log("Validate license");


		console.log("device id "+device.uuid);
		window.localStorage.setItem("deviceId", device.uuid);
		app.deviceId = device.uuid;
		$('#deviceId').text(app.deviceId);

	    navigator.splashscreen.hide();
		//app.checkLicenseValid();

	    console.log("onDeviceReady() completes");

	},
	checkLicenseValid : function(){

		if(!app.isLicenseValid){
           app.isLicenseValid = appSetting.isLicenseValid();
		   if(!app.isLicenseValid)
			alert("Your license is invalid or expired! Please check from settings screen!");
		}

		return app.isLicenseValid;

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
			app.showPage('scanPage');

			var permStorage=window.localStorage;
			var appVersion = permStorage.getItem(KEY_APP_VERSION);

			if(appVersion ==null || appVersion==undefined || APP_VERSION!=appVersion ){//init defaults
				alert("NOTE : Application settings not configured for app version "+APP_VERSION+". Using defaults!");
				appSetting.setDefaultSettings(permStorage);
			    appSetting.getSettingsFromServer(); //TODO: THIS needs server to be configured
				appVersion = permStorage.getItem(KEY_APP_VERSION);
				console.log("Saved default values for version : "+ appVersion);
			}else{
				console.log("Using settings for version : "+ appVersion);
			}
			appSetting.updateSettingsView(permStorage);



	},
	showPage : function(pageId){
		$('#scanPage').hide();
		$('#settingsPage').hide();
		$('#'+pageId).show();

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
	showMessage: function(str){
		console.log(str);
		var date1 =(new Date()).format("DD/MM HH:m:s");
		 $("#statusMessage").html(date1 + " : "+ str );
		 $("#statusMessage").show();
	},
    isLocal: function(){
	 		return (window.location!=null && window.location.hostname=="localhost");

	},
	captureError: function(e){
		alert("capture error: "+JSON.stringify(e));
		console.log("capture error: "+JSON.stringify(e));
	},
	captureSuccess: function(s){
		alert("success "+ s[0].fullPath);
		console.log("Success");
		var v = "<ul>";
		var path = s[0].fullPath.replace(':/',':///');
		var newPath = cordova.file.dataDirectory+ "a.mp4";
		app.moveFile(path, cordova.file.dataDirectory, "a.mp4");
		//v += "<li><a href='#' onclick='app.playVideo(\"file:///mnt/sdcard/DCIM/Camera/20160113_121952.mp4\")'>" + s[0].fullPath + "</a></li>";
		v += '<li><a href="#" onclick="app.playVideo(\''+newPath+ '\')">' +newPath + '</a></li>';
		v += "</ul>";
		$("#videoArea").html(v);
	},
	playVideo: function(src){
			   alert("playing "+ src);
			  VideoPlayer.play(src,
								{
									volume: 0.5,
									scalingMode: VideoPlayer.SCALING_MODE.SCALE_TO_FIT_WITH_CROPPING
								},
								function () {
									console.log("video completed");
								},
								function (err) {
									console.log(err);
						});
     },
     moveFile: function(src,destnDir, newFileName){
			 var fail = function(err) { console.log(err);alert(err); }
			 window.resolveLocalFileSystemURI(src, function(file) {   // src= "file:///example.txt"
				window.resolveLocalFileSystemURI(destnDir, function(destination) {  // destnDir="file:///directory-to-move-to"
						  file.moveTo(destination,newFileName);  //newFileName="example.txt"
				},fail)
			},fail);
	 },
	 log: function(str){
	    console.log(str);
	    $("#scan-status").html(str);
	   // alert(str);
	 },
	  onError: function(reason) {
	         app.log("ERROR: " + reason);
    },
    drawOnCanvas: function(){
			var c = document.getElementById("myCanvas");
			var ctx = c.getContext("2d");
			//circle
			ctx.beginPath();
			ctx.arc(95,50,40,0,2*Math.PI);
			ctx.stroke();

			//text
			ctx.font = "30px Arial";
			ctx.fillText("Hello",10,50);

			//line
			ctx.moveTo(0,0);
			ctx.lineTo(200,100);
			ctx.stroke();
	}
};
$(function() {

	$("#scanBle").click(function() {
        app.log("Scanning for BLE device : "+ble);
		ble.startScan([], function(device) {
			$("#scan-status").html("Found device");
		    app.log(JSON.stringify(device));
		}, app.onError);
		$("#scan-status").html("Started scanning");
	});

	$("#scanStopBle").click(function() {
        app.log("Stopping ble scan : "+ble);
		ble.stopScan();
		app.log("Scan stopped");
	});
	$("#settingsButton").click(function() {
		app.showPage('settingsPage');
	});
	$("#saveSettings").click(function() {
		appSetting.saveSettings();
	});
	$("#resetSettingsToDefault").click(function() {
		appSetting.resetSettingsToDefault();
	});
	$("#getServerSettings").click(function() {
		appSetting.getSettingsFromServer();
	});


	$(document).delegate('.ui-navbar a', 'click', function() {
		$(this).addClass('ui-btn-active');
		$('.content_div').hide();
		$('#' + $(this).attr('data-href')).show();
	});

});

