var KEY_SERVER_URL="serverUrl";

var app = {
	CUSTOMER_ID : 1,
	HIGH_GPS_ACCURACY : true,	// some emulators require true.
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
			$('#serverUrl').val(permStorage.getItem(KEY_SERVER_URL));
			$("#serverUrlTxt").html(permStorage.getItem(KEY_SERVER_URL));
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
		if (networkState == Connection.NONE) {
			this.failElement(elem);
		} else {
			this.succeedElement(elem);
		}
		elem.innerHTML = 'Internet: ' + states[networkState];
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
		$("#serverUrlTxt").html(permStorage.getItem(KEY_SERVER_URL));
		alert("Saved");
	});

	$(document).delegate('.ui-navbar a', 'click', function() {
		$(this).addClass('ui-btn-active');
		$('.content_div').hide();
		$('#' + $(this).attr('data-href')).show();
	});

});