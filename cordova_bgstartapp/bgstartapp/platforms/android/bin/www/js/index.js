var myService;
var defaultPackageName="com.bri8.gps";
var defaultTimerInterval = 15 * 60;//15 minutes 
var timerInterval;
var packageName;

var factory;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    
    // deviceready Event Handler
    onDeviceReady: function() {
    	  console.log("onDeviceReady");
    	  //defaults
    	  $("#timerInterval").val(defaultTimerInterval);
    	  $("#packageName").val(defaultPackageName);
    	  factory = cordova.require('com.red_folder.phonegap.plugin.backgroundservice.BackgroundService')
    	  go();
          app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    	 console.log("receivedEvent");
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function displayResult(data) {
   alert("Is service running: " + data.ServiceRunning);
}

function displayError(data) {
   alert("We have an error");
}

function updateHandler(data) {
	   if (data.LatestResult != null) {
	      try {
	         var resultMessage = document.getElementById("resultMessage");
	         resultMessage.innerHTML = data.LatestResult.Message;
	      } catch (err) {
	    	   alert(err);
	      }
	   }
	}
	 
	 
 function go() {
	 console.log("Go()");
	 if(myService ==null){
		 myService = factory.create("com.bri8.startapp.StartAppService");
		 
	 }else{
		 alert("Service already created. Cant create again  packageName:"+ packageName +", timerInterval : "+ timerInterval);
	 }
	 timerInterval = $("#timerInterval").val();//seconds
	 packageName = $("#packageName").val();//'';
	 
     myService.getStatus(function(r){startService(r)}, function(e){displayError(e)});
     alert("Background service started");
}
	
function startService(data) {
	console.log("startService");
	   if (data.ServiceRunning) {
		   console.log("  enableTimer");
	      enableTimer(data);
	   } else {
		   packageName = $("#packageName").val()
		   console.log("  myService.startService package: " +packageName);
		   var config = { "packageName" : "\""+ packageName +"\"" }; 
		    //TODO: setting config is not working for some strange reason. https://github.com/Red-Folder/bgs-core/wiki/Using-the-Configuration
		   //myService.setConfiguration(config, function(r){alert(r)}, function(r){alert("error : "+r)});
	       myService.startService(function(r){enableTimer(r)}, function(e){displayError(e)});
	       myService.registerForBootStart(function(r){enableTimer(r)}, function(e){displayError(e)});

	   }
}
	
function enableTimer(data) {
	   if (data.TimerEnabled) {
	      registerForUpdates(data);
	   } else {
	      myService.enableTimer(timerInterval * 1000, function(r){registerForUpdates(r)}, function(e){displayError(e)});
	   }
}
	
function registerForUpdates(data) {
	   if (!data.RegisteredForUpdates) {
	      myService.registerForUpdates(function(r){updateHandler(r)}, function(e){handleError(e)});
	   }
}