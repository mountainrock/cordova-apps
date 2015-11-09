SELECT * FROM `gpslocations` where deviceId like '92f51e4%' order by gpsTime desc


//Europa settings:
//---------------
in settings.js
var DEFAULT_SERVER_URL="http://gpstracker.run/europa/index.php"
var DEFAULT_TASK_SERVER_URL="http://europa-mysore.duckdns.org:8085/jcrm";
var DEFAULT_APK_UPDATE_URL="http://gpstracker.run/europa/apk/superGps2-latest.apk"
var DEFAULT_CUSTOMER_ID="1";
in index.js
var IS_TASK_ENABLED=true;

//Generic app NO TASK settings (Customer Id = 2)
//-----------------------------------------------
in settings.js
var DEFAULT_SERVER_URL="http://bri8school.in/demo/gps2/index.php";
var DEFAULT_TASK_SERVER_URL="NA";
var DEFAULT_APK_UPDATE_URL="http://bri8school.in/app/superGps2-latest-notask.apk";
var DEFAULT_CUSTOMER_ID="2";
in index.js
var IS_TASK_ENABLED=false;


TODO:
----
Fix auto turn on internet
Fix/test auto turn on GPS

For europa propose app lock : https://play.google.com/store/apps/details?id=org.dss.applocker&hl=en  
  Turn lock on settings, apk install, supergps2