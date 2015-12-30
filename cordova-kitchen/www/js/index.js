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

		console.log("check net connection");
		app.checkConnection();

		console.log("initView()");
		app.initView();

		console.log("Validate license");


		console.log("device id "+device.uuid);
		window.localStorage.setItem("deviceId", device.uuid);
		app.deviceId = device.uuid;
		$('#deviceId').text(app.deviceId);

		console.log("Loading tasks");
		task.getTasks();

	    navigator.splashscreen.hide();
		app.checkLicenseValid();
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
			app.showPage('takeOrderPage');

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
		$('#invoicePage').hide();
		$('#takeOrderPage').hide();
		$('#infoPage').hide();
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
	}
};
$(function() {

	$("#reloadInvoices").click(function(e) {
		e.preventDefault();
		task.getTasks();
	});
	$("#takeOrder,#takeOrderButton").click(function() {
		if(app.checkLicenseValid() ==false){
			return;
		}
		app.showPage('takeOrderPage');
		$("#addOrder,#confirmOrder,#addNewOrder").show();
		$("#productBody,#totalItems,#totalQty,#totalAmount,#invoiceNoTxt").html("");
		$("#response,#showerror").hide();
		$('#orderForm')[0].reset();
	});
	$("#invoiceButton").click(function() {
		app.showPage('invoicePage');
		task.getTasks();
	});
	$("#infoButton").click(function() {
		app.showPage('infoPage');
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

