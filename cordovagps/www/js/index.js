var KEY_SERVER_URL="serverUrl";
var KEY_DEBUG="debug";
var KEY_CUSTOMER_ID="customerId";
var DEBUG_URL="http://jsconsole.com/remote.js?FF53D2D5-E2A7-46C9-B9C6-B7F5D5CA8953";

var app = {
	CUSTOMER_ID : 1,  //default
	HIGH_GPS_ACCURACY : true,	// some emulators require true.
	NAME : "GPS Tracker",
	position : null,
	deviceId : "",
	passcode : 0,
	timeLastSubmit : 0,
	forcedSubmit : false, // set if user explicitly presses submit button.
							// Used to determine if we show alert boxes.

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
		var debug = permStorage.getItem(KEY_DEBUG);
		if(debug!=null && debug=="true"){
			includeScript(DEBUG_URL);
		}
	},
	onDeviceReady : function() {
		console.log("onDeviceReady called");
		navigator.splashscreen.hide();
		console.log("check net connection");
		app.checkConnection();
		console.log("gps init()");
		gps.init();
		
		console.log("device id "+device.uuid);
		window.localStorage.setItem("deviceId", device.uuid);
		this.deviceId = device.uuid;
		$('#deviceId').text(this.deviceId);
		
		console.log("loadRoutesIntoDropdownBox");
		loadRoutesIntoDropdownBox(); //maps
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
			var sUrl = permStorage.getItem(KEY_SERVER_URL);
			if(sUrl!=null && sUrl!=undefined){
				$('#serverUrl').val(sUrl);
				$("#serverUrlTxt").html(sUrl);
			}
			var customerId = permStorage.getItem(KEY_CUSTOMER_ID);
			if(customerId!=null && customerId!=undefined){
				$('#customerId').val(customerId);
				$("#customerIdTxt").html(customerId);
				this.CUSTOMER_ID = customerId;
			}
			var debug = permStorage.getItem(KEY_DEBUG);
			if(debug!=null && debug!=undefined){
				$('#debug').val(debug);
			}
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
	}
};
$(function() {

	$("#submit-passcode").click(function() {
		app.forcedSubmit = true; // forces pop-up
		app.submitToServer();
	});
	
	$("#saveSettings").click(function() {
		console.log("Saving settings");
		 //save settings
		var permStorage=window.localStorage;
		permStorage.setItem(KEY_SERVER_URL, $('#serverUrl').val());
		permStorage.setItem(KEY_DEBUG, $('#debug').val());
		permStorage.setItem(KEY_CUSTOMER_ID, $('#customerId').val());
		this.CUSTOMER_ID = $('#customerId').val();
		$("#serverUrlTxt").html(permStorage.getItem(KEY_SERVER_URL));
		$("#customerIdTxt").html(this.CUSTOMER_ID);
		navigator.notification.alert("Saved fine. Thanks!", null, app.NAME);
	});

	$(document).delegate('.ui-navbar a', 'click', function() {
		$(this).addClass('ui-btn-active');
		$('.content_div').hide();
		$('#' + $(this).attr('data-href')).show();
	});
	
});

function includeScript(filename)
{
   var head = document.getElementsByTagName('head')[0];
   var script = document.createElement('script');
   script.src = filename;
   script.type = 'text/javascript';
   head.appendChild(script)
} 