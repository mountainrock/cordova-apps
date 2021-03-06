    'use strict';
    var routeSelect = document.getElementById('routeSelect');
    var map = document.getElementById('map-canvas');
    var autoRefresh = false;
    var intervalID = 0;
    var sessionIDArray = [];
    var viewingAllRoutes = false;
        
    $("#routeSelect").change(function() {
        if (hasMap()) {
            viewingAllRoutes = false;
            
            getRouteForMap();
        } 
    });
       
    $("#refresh").click(function() {
    		loadRoutesIntoDropdownBox();
            if (hasMap()) {
                getRouteForMap();
            }             
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
    
 function loadRoutes(json) {      
        console.log("loadRoutes "+ json);
        if (json.length == 0) {
            showPermanentMessage('There are no routes available to view');
        }
        else {
            // create the first option of the dropdown box
        	$('#routeSelect').find('option').remove();
        	
            var option = document.createElement('option');
            option.setAttribute('value', '0');
            if(json.locations.length==0){
            	 option.innerHTML = 'No Routes found';
            }else{
            	option.innerHTML = 'Select Route...';
            }
            routeSelect.appendChild(option);

            // when a user taps on a marker, the position of the sessionID in this array is the position of the route
            // in the dropdown box. it's used below to set the index of the dropdown box when the map is changed
            sessionIDArray = [];
            
            // iterate through the routes and load them into the dropdwon box.
            var index=0;
            $(json.locations).each(function(key, value){
                var option = document.createElement('option');
                option.setAttribute('value', $(this).attr('sessionID'));

                sessionIDArray.push($(this).attr('sessionID'));

                option.innerHTML = $(this).attr('sessionID') + " " + $(this).attr('gpsTime');
                routeSelect.appendChild(option);
                index++;
            });

            // need to reset this for firefox
            routeSelect.selectedIndex = index;
            $('#routeSelect').change();
            //showPermanentMessage('Please select a route below');
        }
    }

      function loadGPSLocations(json) {
         console.log("loadGPSLocations " + json);
        
        if (json.length == 0) {
            showPermanentMessage('There is no tracking data to view');
            map.innerHTML = '';
        }
        else {
            if (map.id == 'map-canvas') {
                // clear any old map objects
                document.getElementById('map-canvas').outerHTML = "<div id='map-canvas'></div>";
           
                // use leaflet (http://leafletjs.com/) to create our map and map layers
                var gpsTrackerMap = new L.map('map-canvas');
            
                var googleMapsLayer = new L.Google('ROADMAP');
            
                // this fixes the zoom buttons from freezing
                // https://github.com/shramov/leaflet-plugins/issues/62
                L.polyline([[0, 0], ]).addTo(gpsTrackerMap);

                // this sets which map layer will first be displayed
                gpsTrackerMap.addLayer(googleMapsLayer);

            }

                var finalLocation = false;
                var counter = 0;
                var locationArray = [];
                
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

                    var marker = createMarker(
                        latitude,
                        longitude,
                        $(this).attr('speed'),
                        $(this).attr('direction'),
                        $(this).attr('distance'),
                        $(this).attr('locationMethod'),
                        $(this).attr('gpsTime'),
                        $(this).attr('userName'),
                        $(this).attr('sessionID'),
                        $(this).attr('accuracy'),
                        $(this).attr('extraInfo'),
                        gpsTrackerMap, finalLocation);
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

    function loadRoutesIntoDropdownBox() {  
       var serverUrl= $('#serverUrl').val();
       var isConnected = app.checkConnection();
       if(isConnected == false){
    	   alert("No internet connection available to load history");
    	   return;
       }
       console.log("loadRoutesIntoDropdownBox :"+ serverUrl + "/getRoutesForUser?deviceId="+ device.uuid);
		$.ajax({
            url: serverUrl + "/Gps/getRoutesForUser?deviceId="+  device.uuid+"&customerId="+app.customerId,
            type: 'GET',
            timeout: DEFAULT_TIMEOUT_SECS,
            success: function(data) {
                console.log("loadRoutes: "+data); //should call loadRoutes() callback
                loadRoutes(data);
            },
			error: function (xhr, status, errorThrown) {
				console.log("error status: " + xhr.status);
				console.log("errorThrown: " + errorThrown);
			}
        });		
    }    
    
   
    function getRouteForMap() { 
        if (hasMap()) {
            console.log("Loading route for :"+$("#routeSelect").val() );
        	var serverUrl= $('#serverUrl').val();
			$.ajax({
				url: serverUrl + "/Gps/getRoutesForMapBySession?sessionId="+ $('#routeSelect').val() + "&deviceId=" + device.uuid+"&customerId="+app.customerId,
				type: 'GET',
				timeout: DEFAULT_TIMEOUT_SECS,
				success: function(data) {
					console.log("loadGPSLocations : "+data);
					loadGPSLocations(data);
				},
				error: function (xhr, status, errorThrown) {
					console.log("error status: " + xhr.status);
					console.log("errorThrown: " + errorThrown);
					alert("Error : Check user is mapped to device? , status : "+ xhr.status+" , errorThrown :"+ errorThrown);
				}
			   });
		        
				
        } 
    }

  
    function createMarker(latitude, longitude, speed, direction, distance, locationMethod, gpsTime,
                          userName, sessionID, accuracy, extraInfo, map, finalLocation) {
        var iconUrl;

        if (finalLocation) {
            iconUrl = 'img/gps/coolred_small.png';
        } else {
            iconUrl = 'img/gps/coolgreen2_small.png';
        }

        var markerIcon = new L.Icon({
                iconUrl:      iconUrl,
                shadowUrl:    'img/gps/coolshadow_small.png',
                iconSize:     [12, 20],
                shadowSize:   [22, 20],
                iconAnchor:   [6, 20],
                shadowAnchor: [6, 20],
                popupAnchor:  [-3, -25]
        });

        var lastMarker = "</td></tr>";

        // when a user clicks on last marker, let them know it's final one
        if (finalLocation) {
            lastMarker = "</td></tr><tr><td align=left>&nbsp;</td><td><b>Final location</b></td></tr>";
        }

        // convert from meters to feet
        accuracy = parseInt(accuracy * 3.28);

        var popupWindowText = "<table border=0 style=\"font-size:95%;font-family:arial,helvetica,sans-serif;color:#000;\">" +
            "<tr><td align=right>&nbsp;</td><td>&nbsp;</td><td rowspan=2 align=right>" +
            "<img src=img/gps/" + getCompassImage(direction) + ".jpg alt= />" + lastMarker +
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
            gpstrackerMarker.unbindPopup();
            
            gpstrackerMarker.on("click", function() {        
                var url = serverUrl + '/Gps/getrouteformap.php?sessionid=' + sessionID;

                viewingAllRoutes = false;
 
                var indexOfRouteInRouteSelectDropdwon = sessionIDArray.indexOf(sessionID) + 1;
                routeSelect.selectedIndex = indexOfRouteInRouteSelectDropdwon;

                if (autoRefresh) {
                    restartInterval(); 
                }

                $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: 'json',
                    timeout: DEFAULT_TIMEOUT_SECS,
                    success: function(data) {
                        loadGPSLocations(data);
                    },
                    error: function (xhr, status, errorThrown) {
                        console.log("status: " + xhr.status);
                        console.log("errorThrown: " + errorThrown);
                    }
                 });
            }); // on click
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

    function displayCityName(latitude, longitude, fieldName) {
    	console.log("displaying address:::");
        var lat = parseFloat(latitude);
        var lng = parseFloat(longitude);
        var latlng = new google.maps.LatLng(lat, lng);
        var reverseGeocoder = new google.maps.Geocoder();
        reverseGeocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
            	console.log("reverse geo :"+ results[0].formatted_address+'---' + results[1].formatted_address);
                // results[0] is full address
                if (results[1]) {
                    var reverseGeocoderResult = results[1].formatted_address; 
                    if(fieldName!=null){
                        $("#" + fieldName).html(results[0].formatted_address);
                    }
                    else{
                    	showPermanentMessage(reverseGeocoderResult);
                    }
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
        intervalID = setInterval(getRouteForMap, 60 * 1000);          
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
