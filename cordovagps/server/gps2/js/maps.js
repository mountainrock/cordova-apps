jQuery(document).ready(function($) {
    'use strict';
    var routeSelect = document.getElementById('routeSelect');
    var map = document.getElementById('map-canvas');
    var autoRefresh = false;
    var intervalID = 0;
    var sessionIDArray = [];
    var viewingAllRoutes = false;
    var baseUrl = baseurl; 
   
    loadUsersIntoDropdownBox();
    
    $("#routeSelect").change(function() {
        if (hasMap()) {
            viewingAllRoutes = false; 
            getRouteForMap();
        } 
    });
    $("#userSelect").change(function() {
            getRoutesForUser();
    });
       
    $("#refresh").click(function() {
        if (viewingAllRoutes) {
            loadCurrentUsersLocation(); 
        } else {
            if (hasMap()) {
                getRouteForMap();
                getRoutesForUser();
            }             
        }
        
    });
    
     $("#loadCurrentLocation").click(function() {
            loadCurrentUsersLocation();
    });
    
       
    $("#delete").click(function() {
        deleteRoute();
    });       
        
    $('#autorefresh').click(function() { 
        if (autoRefresh) {
            turnOffAutoRefresh();           
        } else {
            turnOnAutoRefresh();                     
        }
    }); 
    
    $("#viewall").click(function() {
        getAllRoutesForMap();
    });
    

    function getAllRoutesForMap() {
       var mockJson = "";
       var jsonObj = JSON.parse(mockJson );
       loadGPSLocations(jsonObj );
    }  
      
   
    function getRouteForMap() { 
        if (hasMap()) {
		 console.log("Route select : "+$("#routeSelect").val());
		$.ajax({
			url: baseUrl+ "/index.php/Gps/getRoutesForMapBySession?sessionId="+ $('#routeSelect').val() +"&userId=" + $('#userSelect').val(),
			type: 'GET',			
			dataType: 'json',
			success: function(data) {
				loadGPSLocations(data);
			},
			error: function (xhr, status, errorThrown) {
				console.log("error status: " + xhr.status);
				console.log("errorThrown: " + errorThrown);
			}
		   });	
        } 
    }        
    
     function loadUsersIntoDropdownBox() {      
       
	$.ajax({
            url: baseUrl + "/index.php/User/getUsersSelectDropDownByCustomerId?customerId=" + customerId,
            type: 'GET', 
            dataType: 'html',
            success: function(data) {
                  console.log("loading users");
                  $('#userSelect').html(data);
		},
	    error: function (xhr, status, errorThrown) {
				console.log("error status: " + xhr.status);
				console.log("errorThrown: " + errorThrown);
		}
        });		
    }    
    
    function getRoutesForUser(){
	$.ajax({
		url: baseUrl + "/index.php/Gps/getRoutesForUser?userId="+ $('#userSelect').val(),
		type: 'GET',
		success: function(data) {
		        loadRoutes(data);
		},
		error: function (xhr, status, errorThrown) {
			console.log("error status: " + xhr.status);
			console.log("errorThrown: " + errorThrown);
		}
	   });
    }
    
   function loadCurrentUsersLocation(){
   // + $('#userSelect').val(),
        viewingAllRoutes = true;
        var sessionId = Date.today().toString("ddd MMM dd yyyy");
        $.ajax({
		url: baseUrl + "/index.php/Gps/getCurrentUsersLocation?sessionId="+ sessionId,
		type: 'GET',
		dataType: 'json',
		success: function(data) {
		        showCurrentUsersLocation(data);
		},
		error: function (xhr, status, errorThrown) {
			console.log("error status: " + xhr.status);
			console.log("errorThrown: " + errorThrown);
		}
	   });
    }
        
    function loadRoutes(json) {      

        if (json.length == 0) {
            showPermanentMessage('There are no routes available to view');
        }
        else {
            // create the first option of the dropdown box
            var options = "<option value=0>Select Route</option>";
            
             // when a user taps on a marker, the position of the sessionID in this array is the position of the route
            // in the dropdown box. its used below to set the index of the dropdown box when the map is changed
            sessionIDArray = [];
          
            // iterate through the routes and load them into the dropdwon box.
            $(json.locations).each(function(key, value){
            	var val= $(this).attr('sessionID');
            	var sLabel = $(this).attr('sessionID') + " " + $(this).attr('gpsTime');
	        options = options +  "<option value='" + val + "'>" + sLabel + "</option>";
                sessionIDArray.push($(this).attr('sessionID'));

            });
           

            // need to reset this for firefox
            $('#routeSelect').html(options);

            showPermanentMessage('Please select a route below');
        }
    }
    
    
   function showCurrentUsersLocation(json){
     console.log("showCurrentUsersLocation");
     if (json.length == 0 || json.locations.length==0) {
            showPermanentMessage('<span style="color:red">There is no tracking data to view</span>');
            map.innerHTML = '';
        }
        else {
               var gpsTrackerMap = createMap();

                var finalLocation = false;
                var counter = 0;
                var prevLocation = null;
                var locationArray =[];
                // iterate through the locations and create map markers for each location
                $(json.locations).each(function(key, value){
                    var latitude =  $(this).attr('latitude');
                    var longitude = $(this).attr('longitude');
                    var tempLocation = new L.LatLng(latitude, longitude);
                    locationArray.push(tempLocation);             
                    counter++;
                    var userName= $(this).attr('userName');
                    var lastTime =  $(this).attr('lastGpsTime');
                    var imgUrl = baseUrl + 'images/gps-user.png'
                    var  myIcon = L.divIcon({className: 'gps-user-icon', html:'<img src='+imgUrl+ ' /><br/><div class="gps-user-icon"><b>'+userName+'</b><br/>'+lastTime+'</div>'});
		    L.marker(tempLocation,  {icon: myIcon}).addTo(gpsTrackerMap);
   
                });
                
                // fit markers within window
                var bounds = new L.LatLngBounds(locationArray);
                gpsTrackerMap.fitBounds(bounds);
                
	        
                // restarting interval here in case we are coming from viewing all routes
                if (autoRefresh) {
                    restartInterval();
                } 
            }
    
    }


	function createMap(){
        	 console.log("creating map");
         	if (map.id == 'map-canvas') {
	                // clear any old map objects
	                document.getElementById('map-canvas').outerHTML = "<div id='map-canvas'></div>";
	           
	                // use leaflet (http://leafletjs.com/) to create our map and map layers
	                var gpsTrackerMap = new L.map('map-canvas');
	            
	                var openStreetMapsURL = ('https:' == document.location.protocol ? 'https://' : 'http://') +
	                 '{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	                var openStreetMapsLayer = new L.TileLayer(openStreetMapsURL,
	                {attribution:'&copy;2014 <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'});
	
	                // need to get your own bing maps key, http://www.microsoft.com/maps/create-a-bing-maps-key.aspx
	                var bingMapsLayer = new L.BingLayer("AnH1IKGCBwAiBWfYAHMtIfIhMVybHFx2GxsReNP5W0z6P8kRa67_QwhM4PglI9yL");
	                var googleMapsLayer = new L.Google('ROADMAP');
	            
	                // this fixes the zoom buttons from freezing
	                // https://github.com/shramov/leaflet-plugins/issues/62
	                L.polyline([[0, 0], [51.51019814, -0.187030437] ]).addTo(gpsTrackerMap);
	
	                // this sets which map layer will first be displayed
	                gpsTrackerMap.addLayer(googleMapsLayer);
	
	                // this is the switcher control to switch between map types
	                gpsTrackerMap.addControl(new L.Control.Layers({
	                    'Bing Maps':bingMapsLayer,
	                    'Google Maps':googleMapsLayer,
	                    'OpenStreetMaps':openStreetMapsLayer
	                }, {}));
            	}
       	     return gpsTrackerMap;
	}
 
     function loadGPSLocations(json) {
        // console.log(JSON.stringify(json));
        
        if (json.length == 0) {
            showPermanentMessage('There is no tracking data to view');
            map.innerHTML = '';
        }
        else {           
		var gpsTrackerMap = createMap();
                var finalLocation = false;
                var counter = 0;
                var prevLocation = null;
                var locationArray =[];
                // iterate through the locations and create map markers for each location
                $(json.locations).each(function(key, value){
                    var latitude =  $(this).attr('latitude');
                    var longitude = $(this).attr('longitude');
                    var tempLocation = new L.LatLng(latitude, longitude);
                          locationArray.push(tempLocation);             
                    counter++;

                    // want to set the map center on the last location
                    if (counter == $(json.locations).length) {
                        //gpsTrackerMap.setView(tempLocation, zoom);  if using fixed zoom
                        finalLocation = true;
                    
                        if (!viewingAllRoutes) {
                            displayCityName(latitude, longitude);
                        }
                    }
                    
                    if(prevLocation!=null){
			var r = 32;
			var g = 178;
			var b = (170 + counter)%255;
			var color= "rgb("+r+" ,"+g+","+ b+")"; 
                        createPolyLine([prevLocation,tempLocation], color, gpsTrackerMap );
                    }
                    prevLocation  = tempLocation ;
                    var marker = createMarker(
                        latitude,
                        longitude,
                        $(this).attr('speed'),
                        $(this).attr('direction'),
                        $(this).attr('distance'),
                        $(this).attr('locationMethod'),
                        $(this).attr('gpsTime'),
                        $(this).attr('userName2'),
                        $(this).attr('sessionID'),
                        $(this).attr('accuracy'),
                        $(this).attr('extraInfo'),
                        gpsTrackerMap, finalLocation,
                        counter);
                        
                  
                });
                
                // fit markers within window
                var bounds = new L.LatLngBounds(locationArray);
                gpsTrackerMap.fitBounds(bounds);
                
	        
                // restarting interval here in case we are coming from viewing all routes
                if (autoRefresh) {
                    restartInterval();
                } 
            }
    }
    
    //draw polyline
	function createPolyLine(latlongs, color, gpsTrackerMap) {

	    var polyline = new L.Polyline(latlongs, {
	        color: color,
	        opacity: 1,
	        weight: 3,
	        clickable: false
	    }).addTo(gpsTrackerMap);
	
	
	}

  
  
    function createMarker(latitude, longitude, speed, direction, distance, locationMethod, gpsTime,
                          userName, sessionID, accuracy, extraInfo, map, finalLocation, counter) {
        var iconUrl;

        if (finalLocation) {
            iconUrl = baseurl+'images/coolred_small.png';
        } else {
            iconUrl = baseurl+'images/coolgreen2_small.png';
        }

        var markerIcon = L.divIcon({className: 'gps-icon', html:'<img src='+iconUrl + ' /><div class="gps-icon">'+counter+'</div>'});
/*
new L.Icon({
                iconUrl:      iconUrl,
                shadowUrl:    baseurl+'images/coolshadow_small.png',
                iconSize:     [12, 20],
                shadowSize:   [22, 20],
                iconAnchor:   [6, 20],
                shadowAnchor: [6, 20],
                popupAnchor:  [-3, -25]
        });
		*/   

        var lastMarker = "</td></tr>";

        // when a user clicks on last marker, let them know it's final one
        if (finalLocation) {
            lastMarker = "</td></tr><tr><td align=left>&nbsp;</td><td><b>Final location</b></td></tr>";
        }

        // convert from meters to feet
        accuracy = parseInt(accuracy * 3.28);

        var popupWindowText = "<table border=0 style=\"font-size:95%;font-family:arial,helvetica,sans-serif;color:#000;\">" +
            "<tr><td align=right>&nbsp;</td><td>&nbsp;</td><td rowspan=2 align=right>" +
            "<img src="+ baseurl+ "images/" + getCompassImage(direction) + ".jpg alt= />" + lastMarker +
            "<tr><td align=right>Speed:&nbsp;</td><td>" + speed +  " mph</td></tr>" +
            "<tr><td align=right>Distance:&nbsp;</td><td>" + distance +  " mi</td><td>&nbsp;</td></tr>" +
            "<tr><td align=right>Time:&nbsp;</td><td colspan=2>" + gpsTime +  "</td></tr>" +
            "<tr><td align=right>Name:&nbsp;</td><td>" + userName + "</td><td>&nbsp;</td></tr>" +
            "<tr><td align=right>Accuracy:&nbsp;</td><td>" + accuracy + " ft</td><td>&nbsp;</td></tr></table>";


        var gpstrackerMarker;
        var title = userName + " - " + gpsTime;

        // make sure the final red marker always displays on top 
        if (finalLocation) {
            gpstrackerMarker = new L.marker(new L.LatLng(latitude, longitude), {title: title, icon: markerIcon, zIndexOffset: 999}).bindPopup(popupWindowText).addTo(map);
        } else {
            gpstrackerMarker = new L.marker(new L.LatLng(latitude, longitude), {title: title, icon: markerIcon}).bindPopup(popupWindowText).addTo(map);
        }
        
        // if we are viewing all routes, we want to go to a route when a user taps on a marker instead of displaying popupWindow
        if (viewingAllRoutes) {
            
        } 
    }

    function getCompassImage(azimuth) {
        if ((azimuth >= 337 && azimuth <= 360) || (azimuth >= 0 && azimuth < 23))
                return "compassN";
        if (azimuth >= 23 && azimuth < 68)
                return "compassNE";
        if (azimuth >= 68 && azimuth < 113)
                return "compassE";
        if (azimuth >= 113 && azimuth < 158)
                return "compassSE";
        if (azimuth >= 158 && azimuth < 203)
                return "compassS";
        if (azimuth >= 203 && azimuth < 248)
                return "compassSW";
        if (azimuth >= 248 && azimuth < 293)
                return "compassW";
        if (azimuth >= 293 && azimuth < 337)
                return "compassNW";

        return "";
    }
    
    // check to see if we have a map loaded, don't want to autorefresh or delete without it
    function hasMap() {
        if (routeSelect.selectedIndex == 0) { // means no map
            return false;
        }
        else {
            return true;
        }
    }

    function displayCityName(latitude, longitude) {
        var lat = parseFloat(latitude);
        var lng = parseFloat(longitude);
        var latlng = new google.maps.LatLng(lat, lng);
        var reverseGeocoder = new google.maps.Geocoder();
        reverseGeocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                // results[0] is full address
                if (results[1]) {
                    var reverseGeocoderResult = results[1].formatted_address; 
                    showPermanentMessage(reverseGeocoderResult);
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }

    function turnOffAutoRefresh() {
        showMessage('Auto Refresh Off');
        $('#autorefresh').val('Auto Refresh Off');
    
        autoRefresh = false;
        clearInterval(intervalID);         
    }

    function turnOnAutoRefresh() {
        showMessage('Auto Refresh On (1 min)'); 
        $('#autorefresh').val('Auto Refresh On');
        autoRefresh = true;

        restartInterval();         
    }
    
    function restartInterval() {
        // if someone is viewing all routes and then switches to a single route
        // while autorefresh is on then the setInterval is going to be running with getAllRoutesForMap
        // and not getRouteForMap 

        clearInterval(intervalID);
        
        if (viewingAllRoutes) {
            intervalID = setInterval(loadCurrentUsersLocation, 60 * 1000); // one minute 
        } else {
            intervalID = setInterval(getRouteForMap, 60 * 1000);          
        }          
    }

    function deleteRoute() {
        if (hasMap()) {				
            var answer = confirm("This will permanently delete this route\n from the database. Do you want to delete?");
            if (answer){
                var url = 'deleteroute.php' + $('#routeSelect').val();
                $.ajax({
                       url: url,
                       type: 'GET',
                       success: function() {
                          deleteRouteResponse();
                          getAllRoutesForMap();
                       }
                   });
            }
            else {
                return false;
            }
        }
        else {
            alert("Please select a route before trying to delete.");
        }
    }

    function deleteRouteResponse() {
        routeSelect.length = 0;

        document.getElementById('map-canvas').outerHTML = "<div id='map-canvas'></div>";

        $.ajax({
               url: 'getroutes.php',
               type: 'GET',
               success: function(data) {
                  loadRoutes(data);
               }
           });
    }

    // message visible for 7 seconds
    function showMessage(message) {
        // if we show a message like start auto refresh, we want to put back our current address afterwards
        var tempMessage =  $('#messages').html();
        
        $('#messages').html(message);
        setTimeout(function() {
            $('#messages').html(tempMessage);
        }, 7 * 1000); // 7 seconds
    }

    function showPermanentMessage(message) {
        $('#messages').html(message);
    }

    // for debugging, console.log(objectToString(map));
    function objectToString (obj) {
        var str = '';
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str += p + ': ' + obj[p] + '\n';
            }
        }
        return str;
    }
    
});