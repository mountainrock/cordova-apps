package com.bri8.cordova.bgloc;

import java.io.DataOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Iterator;
import java.util.Timer;
import java.util.TimerTask;
import java.util.Calendar;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONException;
import org.json.JSONObject;

import com.bri8.cordova.bgloc.data.DAOFactory;
import com.bri8.cordova.bgloc.data.LocationDAO;

import android.annotation.TargetApi;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import static android.telephony.PhoneStateListener.*;
import android.telephony.CellLocation;
import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.BroadcastReceiver;
import android.location.Location;
import android.location.Criteria;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.os.PowerManager;
import android.os.SystemClock;
import android.provider.Settings;
import android.util.Log;
import android.widget.Toast;
import static java.lang.Math.*;

public class CopyOfLocationUpdateService extends Service implements LocationListener {
    public static final String TAG = "LocationUpdateService";
    private static final String STATIONARY_REGION_ACTION        = "com.bri8.cordova.bgloc.STATIONARY_REGION_ACTION";
    private static final String STATIONARY_ALARM_ACTION         = "com.bri8.cordova.bgloc.STATIONARY_ALARM_ACTION";
    private static final String SINGLE_LOCATION_UPDATE_ACTION   = "com.bri8.cordova.bgloc.SINGLE_LOCATION_UPDATE_ACTION";
    private static final String STATIONARY_LOCATION_MONITOR_ACTION = "com.bri8.cordova.bgloc.STATIONARY_LOCATION_MONITOR_ACTION";
    private static final long STATIONARY_TIMEOUT                                = 5 * 1000 * 60;    // 5 minutes.
    private static final long STATIONARY_LOCATION_POLLING_INTERVAL_LAZY         = 3 * 1000 * 60;    // 3 minutes.
    private static final long STATIONARY_LOCATION_POLLING_INTERVAL_AGGRESSIVE   = 1 * 1000 * 60;    // 1 minute.
    private static final Integer MAX_STATIONARY_ACQUISITION_ATTEMPTS = 5;
    private static final Integer MAX_SPEED_ACQUISITION_ATTEMPTS = 3;

    private PowerManager.WakeLock wakeLock;
    private Location lastLocation;
    private long lastUpdateTime = 0l;

    private JSONObject params;
    private JSONObject headers;
    private String url = null;

    private float stationaryRadius;
    private Location stationaryLocation;
    private PendingIntent stationaryAlarmPI;
    private PendingIntent stationaryLocationPollingPI;
    private long stationaryLocationPollingInterval;
    private PendingIntent stationaryRegionPI;
    private PendingIntent singleUpdatePI;

    private Boolean isMoving = false;
    private Boolean isAcquiringStationaryLocation = false;
    private Boolean isAcquiringSpeed = false;
    private Integer locationAcquisitionAttempts = 0;

    private Integer desiredAccuracy = 100;
    private Integer distanceFilter = 30; //in meters
    private Integer scaledDistanceFilter;
    private Integer locationTimeout = 30;
    private Boolean isDebugging= false;
    private String notificationTitle = "Background checking";
    private String notificationText = "ENABLED";
    private Boolean isGpsTurnedOnbyUser;
    private boolean isInternetTurnedOnbyUser;
    private boolean turnGpsOnAutomatically;
    private boolean turnInternetOnAutomatically;
    private String workHours;
    private java.util.Map  workHoursMap = new java.util.LinkedHashMap();
    
    String eventType;
    Context ctx=this;

    private static Timer gpsTurnOntimer = new Timer();

    private ToneGenerator toneGenerator;

    private Criteria criteria;

    private LocationManager locationManager;
    private AlarmManager alarmManager;
    private ConnectivityManager connectivityManager;
    private NotificationManager notificationManager;
    public static TelephonyManager telephonyManager = null;
    private Intent onStartIntent = new Intent();

    private boolean isPostingLocations = false;
    @Override
    public IBinder onBind(Intent intent) {
        // TODO Auto-generated method stub
        Log.i(TAG, "OnBind" + intent);
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(TAG, "OnCreate");

        locationManager         = (LocationManager)this.getSystemService(Context.LOCATION_SERVICE);
        alarmManager            = (AlarmManager) this.getSystemService(Context.ALARM_SERVICE);
        toneGenerator           = new ToneGenerator(AudioManager.STREAM_NOTIFICATION, 100);
        connectivityManager     = (ConnectivityManager)getSystemService(Context.CONNECTIVITY_SERVICE);
        notificationManager     = (NotificationManager)this.getSystemService(Context.NOTIFICATION_SERVICE);
        telephonyManager        = (TelephonyManager) getSystemService(Context.TELEPHONY_SERVICE);

        // Stop-detection PI
        stationaryAlarmPI   = PendingIntent.getBroadcast(this, 0, new Intent(STATIONARY_ALARM_ACTION), 0);
        registerReceiver(stationaryAlarmReceiver, new IntentFilter(STATIONARY_ALARM_ACTION));

        // Stationary region PI
        stationaryRegionPI  = PendingIntent.getBroadcast(this, 0, new Intent(STATIONARY_REGION_ACTION), PendingIntent.FLAG_CANCEL_CURRENT);
        registerReceiver(stationaryRegionReceiver, new IntentFilter(STATIONARY_REGION_ACTION));

        // Stationary location monitor PI
        stationaryLocationPollingPI = PendingIntent.getBroadcast(this, 0, new Intent(STATIONARY_LOCATION_MONITOR_ACTION), 0);
        registerReceiver(stationaryLocationMonitorReceiver, new IntentFilter(STATIONARY_LOCATION_MONITOR_ACTION));

        // One-shot PI (TODO currently unused)
        singleUpdatePI = PendingIntent.getBroadcast(this, 0, new Intent(SINGLE_LOCATION_UPDATE_ACTION), PendingIntent.FLAG_CANCEL_CURRENT);
        registerReceiver(singleUpdateReceiver, new IntentFilter(SINGLE_LOCATION_UPDATE_ACTION));

        ////
        // DISABLED
        // Listen to Cell-tower switches (NOTE does not operate while suspended)
        //telephonyManager.listen(phoneStateListener, LISTEN_CELL_LOCATION);
        //

        PowerManager pm         = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, TAG);

        wakeLock.acquire();

        // Location criteria
        criteria = new Criteria();
        criteria.setAltitudeRequired(false);
        criteria.setBearingRequired(false);
        criteria.setSpeedRequired(true);
        criteria.setCostAllowed(true);

    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "LocationUpsateService Started " + startId + ": " + intent);
        if(isDebugging)
        	Toast.makeText(this, "LocationUpsateService Started", Toast.LENGTH_LONG).show();
        if (intent != null) {
            try {
                params = new JSONObject(intent.getStringExtra("params"));
                headers = new JSONObject(intent.getStringExtra("headers"));
                onStartIntent.putExtra("params", intent.getStringExtra("params"));
                onStartIntent.putExtra("headers", intent.getStringExtra("headers"));

                turnGpsOnAutomatically = Boolean.parseBoolean(params.getString("turnGpsOnAutomatically"));
                turnInternetOnAutomatically  = Boolean.parseBoolean(params.getString("turnInternetOnAutomatically"));
                eventType = params.getString("eventtype");
                workHours = params.getString("workHours");
            } catch (JSONException e) {
                // TODO Auto-generated catch block
            	 Log.e(TAG, "Error onStartCommand : "+ e.getMessage());
                e.printStackTrace();
            }
            url = intent.getStringExtra("url");
            stationaryRadius = Float.parseFloat(intent.getStringExtra("stationaryRadius"));
            distanceFilter = Integer.parseInt(intent.getStringExtra("distanceFilter"));
            scaledDistanceFilter = distanceFilter;
            desiredAccuracy = Integer.parseInt(intent.getStringExtra("desiredAccuracy"));
            locationTimeout = Integer.parseInt(intent.getStringExtra("locationTimeout"));
            isDebugging = Boolean.parseBoolean(intent.getStringExtra("isDebugging"));
            notificationTitle = intent.getStringExtra("notificationTitle");
            notificationText = intent.getStringExtra("notificationText");

            // Build a Notification required for running service in foreground.
            Intent main = new Intent(this, BackgroundGpsPlugin.class);
            main.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, main,  PendingIntent.FLAG_UPDATE_CURRENT);

            Notification.Builder builder = new Notification.Builder(this);
            builder.setContentTitle(notificationTitle);
            builder.setContentText(notificationText);
            builder.setSmallIcon(android.R.drawable.ic_menu_mylocation);
            builder.setContentIntent(pendingIntent);
            Notification notification;
            if (android.os.Build.VERSION.SDK_INT >= 16) {
                notification = buildForegroundNotification(builder);
            } else {
                notification = buildForegroundNotificationCompat(builder);
            }
            notification.flags |= Notification.FLAG_ONGOING_EVENT | Notification.FLAG_FOREGROUND_SERVICE | Notification.FLAG_NO_CLEAR;
            startForeground(startId, notification);
        }
        Log.i(TAG, "- url: " + url);
        Log.i(TAG, "- params: " + params.toString());
        Log.i(TAG, "- headers: " + headers.toString());
        Log.i(TAG, "- stationaryRadius(mtrs): "   + stationaryRadius);
        Log.i(TAG, "- distanceFilter(mtrs): "     + distanceFilter);
        Log.i(TAG, "- desiredAccuracy: "    + desiredAccuracy);
        Log.i(TAG, "- locationTimeout(secs): "    + locationTimeout);
        Log.i(TAG, "- isDebugging: "        + isDebugging);
        Log.i(TAG, "- notificationTitle: "  + notificationTitle);
        Log.i(TAG, "- notificationText: "   + notificationText);
        Log.i(TAG, "- turnGpsOnAutomatically: "   + turnGpsOnAutomatically);
        Log.i(TAG, "- turnInternetOnAutomatically: "   + turnInternetOnAutomatically);
        Log.i(TAG, "- workHours: "   + workHours);
        if(workHours!=null){
        	workHoursMap = TimerUtils.getWorkHoursMap(workHours);
        }
        

        this.setPace(false);
        if(isDebugging)
        	Toast.makeText(this, "Background location tracking started : debug = "+ isDebugging, Toast.LENGTH_SHORT).show();

        // the below turn/on off without user permission is based on a user setting!!!
        //turn on or off GPS toggled based on locationTimeout interval

        scheduleGpsTurnOnAutomatically();
        //We want this service to continue running until it is explicitly stopped
        return START_REDELIVER_INTENT;
    }



	private void scheduleGpsTurnOnAutomatically() {
		if(turnGpsOnAutomatically){
        	final int scheduleGpsOnInterval = locationTimeout - 5; //GPS turn on interval in case its off
        	final int gpsTurnOffIntervalGap = 20;
        	Log.i(TAG, " Scheduling to turnGpsOnAutomatically: " + turnGpsOnAutomatically +", scheduleGpsOnInterval(secs) :"+ scheduleGpsOnInterval);
			//gpsTurnOntimer.scheduleAtFixedRate(new GpsTurnOnTask(), 0, 20 * 1000); //scheduleGpsOnInterval
			final Handler handlerGpsOn = new Handler();
			final Handler handlerGpsOff = new Handler();
			
			// turn off gps/internet after 30 seconds automatically.
			final Runnable gpsTurnOffTask = new Runnable() {
				   @Override
				   public void run() {
					   try {
							Log.i(TAG, "GpsTurnOffTask called from post delayed");
							turnGPSOff();
						} catch (Exception e) {
							Log.e(TAG, "Exception GpsTurnOffTask handler :" + e.getMessage(), e);
						}
				   }
			};
			// turn on gps/internet automatically.
			Runnable gpsTurnOnTask = new Runnable() {
				   @Override
				   public void run() {
					   try {
							Log.i(TAG, "GpsTurnOnTask called from post delayed");
							if(workHours!=null && TimerUtils.isTimeInRange(workHoursMap)){
								turnGPSOn();
								handlerGpsOn.postDelayed(this, scheduleGpsOnInterval *1000);
								handlerGpsOff.postDelayed(gpsTurnOffTask, (scheduleGpsOnInterval+gpsTurnOffIntervalGap) *1000);
							}else{
								Log.i(TAG, "Not turning on GPS during non Work hours");
							}
						} catch (Exception e) {
							Log.e(TAG, "Exception GpsTurnOnTask handler :" + e.getMessage(), e);
						}
				   }
				};
			handlerGpsOn.postDelayed(gpsTurnOnTask, scheduleGpsOnInterval *1000);
			handlerGpsOff.postDelayed(gpsTurnOffTask, (scheduleGpsOnInterval+gpsTurnOffIntervalGap) *1000);
			turnGPSOn();
        }
	}


    @TargetApi(16)
    private Notification buildForegroundNotification(Notification.Builder builder) {
        return builder.build();
    }

    @SuppressWarnings("deprecation")
    @TargetApi(15)
    private Notification buildForegroundNotificationCompat(Notification.Builder builder) {
        return builder.getNotification();
    }

    @Override
    public boolean stopService(Intent intent) {
        Log.i(TAG, "- Received stop: " + intent);
        cleanUp();
        if (isDebugging) {
            Toast.makeText(this, "Background location tracking stopped", Toast.LENGTH_SHORT).show();
        }
        return super.stopService(intent);
    }

    /**
     *
     * @param value set true to engage "aggressive", battery-consuming tracking, false for stationary-region tracking
     */
    private void setPace(Boolean value) {
        Log.i(TAG, "setPace: " + value);

        Boolean wasMoving   = isMoving;
        isMoving            = value;
        isAcquiringStationaryLocation = false;
        isAcquiringSpeed    = false;
        stationaryLocation  = null;

        locationManager.removeUpdates(this);

        criteria.setAccuracy(Criteria.ACCURACY_FINE);
        criteria.setHorizontalAccuracy(translateDesiredAccuracy(desiredAccuracy));
        criteria.setPowerRequirement(Criteria.POWER_HIGH);

        if (isMoving) {
            // setPace can be called while moving, after distanceFilter has been recalculated.  We don't want to re-acquire velocity in this case.
            if (!wasMoving) {
                isAcquiringSpeed = true;
            }
        } else {
            isAcquiringStationaryLocation = true;
        }

        // Temporarily turn on super-aggressive geolocation on all providers when acquiring velocity or stationary location.
        if (isAcquiringSpeed || isAcquiringStationaryLocation) {

            locationAcquisitionAttempts = 0;

            Log.i(TAG, String.format("Aggressive ON :isAquiringSpeed : %s,isStationary = %s ", isAcquiringSpeed , isAcquiringStationaryLocation));
            if (isDebugging) {
            	Toast.makeText(this, String.format("Aggressive ON :isAquiringSpeed : %s,isStationary = %s ", isAcquiringSpeed , isAcquiringStationaryLocation), Toast.LENGTH_SHORT).show();
            }
           List<String> matchingProviders = locationManager.getAllProviders();
            Log.i(TAG, String.format(" Using GPS providers: %s",matchingProviders ));
            //try all available providers except passive
            for (String provider: matchingProviders) {
                if (provider != LocationManager.PASSIVE_PROVIDER) {
                    //locationManager.requestLocationUpdates(provider, 0, 0, this);
                	locationManager.requestLocationUpdates(provider, locationTimeout/2 * 1000, 0, this);   //timeout is half the normal timeout

                }
            }
            
           // locationManager.requestLocationUpdates(locationManager.getBestProvider(criteria, true), locationTimeout/2 * 1000, 0, this);   //timeout is half the normal timeout

        } else {
        	Log.i(TAG, String.format("Normal ON :locationTimeout %s, scaledDistanceFilter :%s", locationTimeout,scaledDistanceFilter));
        	if (isDebugging) {
        		Toast.makeText(this, String.format("Normal ON :locationTimeout %s, scaledDistanceFilter :%s", locationTimeout,scaledDistanceFilter ), Toast.LENGTH_SHORT).show();
            }
            locationManager.requestLocationUpdates(locationManager.getBestProvider(criteria, true), locationTimeout*1000, scaledDistanceFilter, this);
        }
    }

    /**
    * Translates a number representing desired accuracy of GeoLocation system from set [0, 10, 100, 1000].
    * 0:  most aggressive, most accurate, worst battery drain
    * 1000:  least aggressive, least accurate, best for battery.
    */
    private Integer translateDesiredAccuracy(Integer accuracy) {
        switch (accuracy) {
            case 1000:
                accuracy = Criteria.ACCURACY_LOW;
                break;
            case 100:
                accuracy = Criteria.ACCURACY_MEDIUM;
                break;
            case 10:
                accuracy = Criteria.ACCURACY_HIGH;
                break;
            case 0:
                accuracy = Criteria.ACCURACY_HIGH;
                break;
            default:
                accuracy = Criteria.ACCURACY_MEDIUM;
        }
        return accuracy;
    }

    /**
     * Returns the most accurate and timely previously detected location.
     * Where the last result is beyond the specified maximum distance or
     * latency a one-off location update is returned via the {@link LocationListener}
     * specified in {@link setChangedLocationListener}.
     * @param minDistance Minimum distance before we require a location update.
     * @param minTime Minimum time required between location updates.
     * @return The most accurate and / or timely previously detected location.
     */
    public Location getLastBestLocation() {
        int minDistance = (int) stationaryRadius;
        long minTime    = System.currentTimeMillis() - (locationTimeout * 1000);

        Log.i(TAG, "- fetching last best location " + minDistance + "," + minTime);
        Location bestResult = null;
        float bestAccuracy = Float.MAX_VALUE;
        long bestTime = Long.MIN_VALUE;

        // Iterate through all the providers on the system, keeping
        // note of the most accurate result within the acceptable time limit.
        // If no result is found within maxTime, return the newest Location.
        List<String> matchingProviders = locationManager.getAllProviders();
        for (String provider: matchingProviders) {
            Log.d(TAG, "- provider: " + provider);
            Location location = locationManager.getLastKnownLocation(provider);
            if (location != null) {
                Log.d(TAG, " location: " + location.getLatitude() + "," + location.getLongitude() + "," + location.getAccuracy() + "," + location.getSpeed() + "m/s");
                float accuracy = location.getAccuracy();
                long time = location.getTime();
                Log.d(TAG, "time>minTime: " + (time > minTime) + ", accuracy<bestAccuracy: " + (accuracy < bestAccuracy));
                if ((time > minTime && accuracy < bestAccuracy)) {
                    bestResult = location;
                    bestAccuracy = accuracy;
                    bestTime = time;
                }
            }
        }
        return bestResult;
    }

    public void onLocationChanged(Location location) {
        Log.d(TAG, "- onLocationChanged: provider : "+location.getProvider()+" :: " + location.getLatitude() + "," + location.getLongitude() + ", accuracy: " + location.getAccuracy() + ", isMoving: " + isMoving + ", speed: " + location.getSpeed());

        if (!isMoving && !isAcquiringStationaryLocation && stationaryLocation==null) {
            // Perhaps our GPS signal was interupted, re-acquire a stationaryLocation now.
            setPace(false);
        }

        if (isDebugging) {
            Toast.makeText(this, "mv:"+isMoving+",acy:"+location.getAccuracy()+",v:"+location.getSpeed()+",df:"+scaledDistanceFilter, Toast.LENGTH_LONG).show();
        }
        if (isAcquiringStationaryLocation) {
            if (stationaryLocation == null || stationaryLocation.getAccuracy() > location.getAccuracy()) {
                stationaryLocation = location;
            }
            if (++locationAcquisitionAttempts == MAX_STATIONARY_ACQUISITION_ATTEMPTS) {
                isAcquiringStationaryLocation = false;
                startMonitoringStationaryRegion(stationaryLocation);
                if (isDebugging) {
                    startTone("long_beep");
                }
            } else {
                // Unacceptable stationary-location: bail-out and wait for another.
                if (isDebugging) {
                    startTone("beep");
                }
                return;
            }
        } else if (isAcquiringSpeed) {
            if (++locationAcquisitionAttempts == MAX_SPEED_ACQUISITION_ATTEMPTS) {
                // Got enough samples, assume we're confident in reported speed now.  Play "woohoo" sound.
                if (isDebugging) {
                    startTone("doodly_doo");
                }
                isAcquiringSpeed = false;
                scaledDistanceFilter = calculateDistanceFilter(location.getSpeed());
                setPace(true);
            } else {
                if (isDebugging) {
                    startTone("beep");
                }
                return;
            }
        } else if (isMoving) {
            if (isDebugging) {
                startTone("beep");
            }
            // Only reset stationaryAlarm when accurate speed is detected, prevents spurious locations from resetting when stopped.
            if ( (location.getSpeed() >= 1) && (location.getAccuracy() <= stationaryRadius) ) {
                resetStationaryAlarm();
            }
            // Calculate latest distanceFilter, if it changed by 5 m/s, we'll reconfigure our pace.
            Integer newDistanceFilter = calculateDistanceFilter(location.getSpeed());
            if (newDistanceFilter != scaledDistanceFilter.intValue()) {
                Log.i(TAG, "- updated distanceFilter, new: " + newDistanceFilter + ", old: " + scaledDistanceFilter);
                scaledDistanceFilter = newDistanceFilter;
                setPace(true);
            }
            if (location.distanceTo(lastLocation) < distanceFilter) {
                return;
            }
        } else if (stationaryLocation != null) {
            return;
        }
        // Go ahead and cache, push to server
        lastLocation = location;
        persistLocation(location);

        if (this.isNetworkConnected()) {
            Log.d(TAG, "Scheduling location network post");
            schedulePostLocations();
        } else {
            Log.d(TAG, "Network unavailable, waiting for now");
        }
    }

    /** Plays debug sound */
    private void startTone(String name) {
        int tone = 0;
        int duration = 1000;

        if (name.equals("beep")) {
            tone = ToneGenerator.TONE_PROP_BEEP;
        } else if (name.equals("beep_beep_beep")) {
            tone = ToneGenerator.TONE_CDMA_CONFIRM;
        } else if (name.equals("long_beep")) {
            tone = ToneGenerator.TONE_CDMA_ABBR_ALERT;
        } else if (name.equals("doodly_doo")) {
            tone = ToneGenerator.TONE_CDMA_ALERT_NETWORK_LITE;
        } else if (name.equals("chirp_chirp_chirp")) {
            tone = ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD;
        } else if (name.equals("dialtone")) {
            tone = ToneGenerator.TONE_SUP_RINGTONE;
        }
        toneGenerator.startTone(tone, duration);
    }

    public void resetStationaryAlarm() {
        alarmManager.cancel(stationaryAlarmPI);
        alarmManager.set(AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + STATIONARY_TIMEOUT, stationaryAlarmPI); // Millisec * Second * Minute
    }

    private Integer calculateDistanceFilter(Float speed) {
        Double newDistanceFilter = (double) distanceFilter;
        if (speed < 100) {
            float roundedDistanceFilter = (round(speed / 5) * 5);
            newDistanceFilter = pow(roundedDistanceFilter, 2) + (double) distanceFilter;
        }
        return (newDistanceFilter.intValue() < 1000) ? newDistanceFilter.intValue() : 1000;
    }

    private void startMonitoringStationaryRegion(Location location) {
        locationManager.removeUpdates(this);
        stationaryLocation = location;

        Log.i(TAG, "- startMonitoringStationaryRegion ( provider : "+location.getProvider()+" :: latlong:" + location.getLatitude() + "," + location.getLongitude() + "), accuracy:" + location.getAccuracy());

        // Here be the execution of the stationary region monitor
        locationManager.addProximityAlert(
                location.getLatitude(),
                location.getLongitude(),
                (location.getAccuracy() < stationaryRadius) ? stationaryRadius : location.getAccuracy(),
                (long)-1,
                stationaryRegionPI
        );

        startPollingStationaryLocation(STATIONARY_LOCATION_POLLING_INTERVAL_LAZY);
    }

    public void startPollingStationaryLocation(long interval) {
        // proximity-alerts don't seem to work while suspended in latest Android 4.42 (works in 4.03).  Have to use AlarmManager to sample
        //  location at regular intervals with a one-shot.
        stationaryLocationPollingInterval = interval;
        alarmManager.cancel(stationaryLocationPollingPI);
        long start = System.currentTimeMillis() + (60 * 1000);
        alarmManager.setInexactRepeating(AlarmManager.RTC_WAKEUP, start, interval, stationaryLocationPollingPI);
    }

    public void onPollStationaryLocation(Location location) {
        if (isMoving) {
            return;
        }
        if (isDebugging) {
            startTone("beep");
        }
    float distance = abs(location.distanceTo(stationaryLocation) - stationaryLocation.getAccuracy() - location.getAccuracy());

        if (isDebugging) {
            Toast.makeText(this, "Stationary exit in " + (stationaryRadius-distance) + "m", Toast.LENGTH_LONG).show();
        }

        // TODO http://www.cse.buffalo.edu/~demirbas/publications/proximity.pdf
        // determine if we're almost out of stationary-distance and increase monitoring-rate.
        Log.i(TAG, "- distance from stationary location: " + distance);
        if (distance > stationaryRadius) {
            onExitStationaryRegion(location);
        } else if (distance > 0) {
            startPollingStationaryLocation(STATIONARY_LOCATION_POLLING_INTERVAL_AGGRESSIVE);
        } else if (stationaryLocationPollingInterval != STATIONARY_LOCATION_POLLING_INTERVAL_LAZY) {
            startPollingStationaryLocation(STATIONARY_LOCATION_POLLING_INTERVAL_LAZY);
        }
    }
    /**
    * User has exit his stationary region!  Initiate aggressive geolocation!
    */
    public void onExitStationaryRegion(Location location) {
        // Filter-out spurious region-exits:  must have at least a little speed to move out of stationary-region
        if (isDebugging) {
            startTone("beep_beep_beep");
        }
        // Cancel the periodic stationary location monitor alarm.
        alarmManager.cancel(stationaryLocationPollingPI);

        // Kill the current region-monitor we just walked out of.
        locationManager.removeProximityAlert(stationaryRegionPI);

        // Engage aggressive tracking.
        this.setPace(true);
    }

    /**
    * TODO Experimental cell-tower change system; something like ios significant changes.
    */
    public void onCellLocationChange(CellLocation cellLocation) {
        Log.i(TAG, "- onCellLocationChange" + cellLocation.toString());
        if (isDebugging) {
            Toast.makeText(this, "Cellular location change", Toast.LENGTH_LONG).show();
            startTone("chirp_chirp_chirp");
        }
        if (!isMoving && stationaryLocation != null) {
            criteria.setAccuracy(Criteria.ACCURACY_FINE);
            criteria.setHorizontalAccuracy(Criteria.ACCURACY_HIGH);
            criteria.setPowerRequirement(Criteria.POWER_HIGH);
            locationManager.requestSingleUpdate(criteria, singleUpdatePI);
        }
    }

    /**
    * Broadcast receiver for receiving a single-update from LocationManager.
    */
    private BroadcastReceiver singleUpdateReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String key = LocationManager.KEY_LOCATION_CHANGED;
            Location location = (Location)intent.getExtras().get(key);
            if (location != null) {
                Log.d(TAG, "- singleUpdateReciever" + location.toString());
                onPollStationaryLocation(location);
            }
        }
    };

    /**
    * Broadcast receiver which detcts a user has stopped for a long enough time to be determined as STOPPED
    */
    private BroadcastReceiver stationaryAlarmReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent)
        {
            Log.i(TAG, "- stationaryAlarm fired");
            setPace(false);
        }
    };
    /**
     * Broadcast receiver to handle stationaryMonitor alarm, fired at low frequency while monitoring stationary-region.
     * This is required because latest Android proximity-alerts don't seem to operate while suspended.  Regularly polling
     * the location seems to trigger the proximity-alerts while suspended.
     */
     private BroadcastReceiver stationaryLocationMonitorReceiver = new BroadcastReceiver() {
         @Override
         public void onReceive(Context context, Intent intent)
         {
             Log.i(TAG, "- stationaryLocationMonitorReceiver fired");
             if (isDebugging) {
                 startTone("dialtone");
             }
             criteria.setAccuracy(Criteria.ACCURACY_FINE);
             criteria.setHorizontalAccuracy(Criteria.ACCURACY_HIGH);
             criteria.setPowerRequirement(Criteria.POWER_HIGH);
             locationManager.requestSingleUpdate(criteria, singleUpdatePI);
         }
     };
    /**
    * Broadcast receiver which detects a user has exit his circular stationary-region determined by the greater of stationaryLocation.getAccuracy() OR stationaryRadius
    */
    private BroadcastReceiver stationaryRegionReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Log.i(TAG, "stationaryRegionReceiver");
            String key = LocationManager.KEY_PROXIMITY_ENTERING;

            Boolean entering = intent.getBooleanExtra(key, false);
            if (entering) {
                Log.d(TAG, "- ENTER");
                if (isMoving) {
                    setPace(false);
                }
            }
            else {
                Log.d(TAG, "- EXIT");
                // There MUST be a valid, recent location if this event-handler was called.
                Location location = getLastBestLocation();
                if (location != null) {
                    onExitStationaryRegion(location);
                }
            }
        }
    };


    /**
    * TODO Experimental, hoping to implement some sort of "significant changes" system here like ios based upon cell-tower changes.
    */
    private PhoneStateListener phoneStateListener = new PhoneStateListener() {
        @Override
        public void onCellLocationChanged(CellLocation location)
        {
            onCellLocationChange(location);
        }
    };

    public void onProviderDisabled(String provider) {
        // TODO Auto-generated method stub
        Log.d(TAG, "- onProviderDisabled: " + provider);
    }
    public void onProviderEnabled(String provider) {
        // TODO Auto-generated method stub
        Log.d(TAG, "- onProviderEnabled: " + provider);
    }
    public void onStatusChanged(String provider, int status, Bundle extras) {
        // TODO Auto-generated method stub
        Log.d(TAG, "- onStatusChanged: " + provider + ", status: " + status);
    }
    private void schedulePostLocations() {
        PostLocationTask task = new CopyOfLocationUpdateService.PostLocationTask();
        Log.d(TAG, "beforeexecute " +  task.getStatus());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB)
            task.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
        else
            task.execute();
        Log.d(TAG, "afterexecute " +  task.getStatus());
    }

    private boolean postLocation(com.bri8.cordova.bgloc.data.Location l, LocationDAO dao) {
        if (l == null) {
            Log.w(TAG, "postLocation: null location");
            return false;
        }
        try {
            lastUpdateTime = SystemClock.elapsedRealtime();
            Log.i(TAG, "Posting  native location update: " + l);
            DefaultHttpClient httpClient = new DefaultHttpClient();
            HttpPost request = new HttpPost(url);

            JSONObject location = new JSONObject();
            location.put("latitude", l.getLatitude());
            location.put("longitude", l.getLongitude());
            location.put("accuracy", l.getAccuracy());
            location.put("speed", l.getSpeed());
            location.put("bearing", l.getBearing());
            location.put("altitude", l.getAltitude());
            location.put("recorded_at", dao.dateToString(l.getRecordedAt()));
            params.put("location", location);
            params.put("eventtype", eventType+"-"+ l.getProvider());

            Log.i(TAG, "location: " + location.toString());

            StringEntity se = new StringEntity(params.toString());
            request.setEntity(se);
            request.setHeader("Accept", "application/json");
            request.setHeader("Content-type", "application/json");

            Iterator<String> headkeys = headers.keys();
            while( headkeys.hasNext() ){
		        String headkey = headkeys.next();
		        if(headkey != null) {
		                    Log.d(TAG, "Adding Header: " + headkey + " : " + (String)headers.getString(headkey));
		                    request.setHeader(headkey, (String)headers.getString(headkey));
		        }
            }
            Log.d(TAG, "Posting to " + request.getURI().toString());
            HttpResponse response = httpClient.execute(request);
            Log.i(TAG, "Response received: " + response.getStatusLine());
            if (response.getStatusLine().getStatusCode() == 200) {
                return true;
            } else {
                return false;
            }
        } catch (Throwable e) {
            Log.w(TAG, "Exception posting location: " + e);
            e.printStackTrace();
            return false;
        }
    }
    private void persistLocation(Location location) {
        LocationDAO dao = DAOFactory.createLocationDAO(this.getApplicationContext());
        com.bri8.cordova.bgloc.data.Location savedLocation = com.bri8.cordova.bgloc.data.Location.fromAndroidLocation(location);

        if (dao.persistLocation(savedLocation)) {
            Log.d(TAG, "Persisted Location: " + savedLocation);
        } else {
            Log.w(TAG, "Failed to persist location");
        }
    }

    private boolean isNetworkConnected() {
        NetworkInfo networkInfo = connectivityManager.getActiveNetworkInfo();
        if (networkInfo != null) {
            Log.d(TAG, "Network found, type = " + networkInfo.getTypeName());
            return networkInfo.isConnected();
        } else {
            Log.d(TAG, "No active network info");
            return false;
        }
    }

    @Override
    public void onDestroy() {
    	cleanUp();
        Log.w(TAG, "------------------------------------------ Destroyed Location update Service");
       // setupAlarmManager();
        super.onDestroy();
    }
    private void cleanUp() {
        locationManager.removeUpdates(this);
        alarmManager.cancel(stationaryAlarmPI);
        alarmManager.cancel(stationaryLocationPollingPI);
        toneGenerator.release();

        unregisterReceiver(stationaryAlarmReceiver);
        unregisterReceiver(singleUpdateReceiver);
        unregisterReceiver(stationaryRegionReceiver);
        unregisterReceiver(stationaryLocationMonitorReceiver);

        if (stationaryLocation != null && !isMoving) {
            try {
                locationManager.removeProximityAlert(stationaryRegionPI);
            } catch (Throwable e) {
                Log.w(TAG, "- Something bad happened while removing proximity-alert");
            }
        }
        stopForeground(true);
        if(isGpsTurnedOnbyUser!=null && isGpsTurnedOnbyUser ==false){
        	turnGPSOff();
        }
        wakeLock.release();
    }

    @TargetApi(Build.VERSION_CODES.ICE_CREAM_SANDWICH)
    @Override
    public void onTaskRemoved(Intent rootIntent) {
        this.stopSelf();
        super.onTaskRemoved(rootIntent);
    }



    public void turnGPSOn()
    {
    	try{
    		
    		Log.i(TAG, "Called turnGPSOn");
	        String provider = Settings.Secure.getString(this.getContentResolver(), Settings.Secure.LOCATION_PROVIDERS_ALLOWED);
	        if(!provider.contains("gps") && turnGpsOnAutomatically)
	            {
	        	Log.i(TAG, "\tTurning on GPS tracking automatically");
	        	isGpsTurnedOnbyUser = false;
	        	// Toast.makeText(this, "Turning on GPS tracking", Toast.LENGTH_SHORT).show();
	            //if gps is disabled
	        	if(RootHelper.isRooted()){
					RootHelper.grantSecureSettings(this);
				}
	        	Intent intent = new Intent("android.location.GPS_ENABLED_CHANGE");
		        intent.putExtra("enabled", true);
		        this.sendBroadcast(intent);
	            Log.i(TAG, "\t\tSending broadcast to turn on GPS tracking automatically");
	        }else{
	        	Log.i(TAG, "\tGPS tracking already turned on by user");
	        	isGpsTurnedOnbyUser = true;
	        }

	        if(turnInternetOnAutomatically){
	        	Log.i(TAG, "*\t\tChecking to turn on internet automatically");
				setMobileDataEnabled(true);
			}
    	}catch(Exception e){
    		Log.e(TAG, "Exception turnGPSOn :"+ e.getMessage(),e);
    	}
    }

    public void turnGPSOff()
    {
    	Log.i(TAG, "******OFFF **** ");
    	Log.i(TAG, "Called turnGPSOff");
    	try{
    		if(isNetworkConnected()){
    			schedulePostLocations();
    		}
    		
	        String provider = Settings.Secure.getString(this.getContentResolver(), Settings.Secure.LOCATION_PROVIDERS_ALLOWED);
	        //provider.contains("gps") &&
	        if(isGpsTurnedOnbyUser == false){ //if gps is enabled and not turned on by user
	        	Log.i(TAG, "\t\tTurning off GPS tracking automatically isGpsTurnedOnbyUser : "+ isGpsTurnedOnbyUser);
	        	if(RootHelper.isRooted()){
					RootHelper.grantSecureSettings(this);
				}
	        	Intent intent = new Intent("android.location.GPS_ENABLED_CHANGE");
	        	intent.putExtra("enabled", false);
	        	sendBroadcast(intent);
	        }else{
	        	Log.i(TAG, "\t\tNot Turning off GPS as its not started programatically isGpsTurnedOnbyUser : "+ isGpsTurnedOnbyUser +", provider : "+ provider);
	        }
	        Log.i(TAG, "  \t\tCheck to turn off internet : turnInternetOnAutomatically="+turnInternetOnAutomatically+", isInternetTurnedOnbyUser="+isInternetTurnedOnbyUser);
	        if(turnInternetOnAutomatically && isInternetTurnedOnbyUser ==false){
	        	Log.i(TAG, "  \t\tCheck and turn off internet");
				setMobileDataEnabled(false);
			}
	    }catch(Exception e){
			Log.e(TAG, "Exception turnGPSOff :"+ e.getMessage(),e);
		}
    }

    private void setMobileDataEnabled( boolean enableInternet)  {
    	Context context = this;
    	try {
    		Log.i(TAG, "  \t\tCalled setMobileDataEnabled() : " + enableInternet);
    		if(isNetworkConnected() && enableInternet == true ){
    			Log.i(TAG, "  \t\t Network already connected");
    			isInternetTurnedOnbyUser = true;
    			if(isDebugging){
    				Toast.makeText(context, "Super GPS: Internet already connected", Toast.LENGTH_SHORT).show();
    			}
    			return;
    		}
    		if(enableInternet ==false && isPostingLocations){
    			Thread.sleep(5*1000); //wait till posting is complete
    		}
    		RootHelper.setMobileDataEnabled(this, enableInternet);

	        if(enableInternet){
	        	isInternetTurnedOnbyUser = false;
	        }
	        Log.i(TAG, "  \t\t Internet turned automatically to : isInternetTurnedOnbyUser :"+isInternetTurnedOnbyUser);
    	 } catch (Exception e) {
             // TODO Auto-generated catch block
              Toast.makeText(context, "Super GPS : setMobileDataEnabled : "+e.getMessage(), Toast.LENGTH_SHORT).show();

         }
    }

    private class PostLocationTask extends AsyncTask<Object, Integer, Boolean> {

        @Override
        protected Boolean doInBackground(Object...objects) {
            Log.i(TAG, "Executing PostLocationTask#doInBackground : isPostingLocations : "+ isPostingLocations);
			try {
				if (isPostingLocations == false) {
					isPostingLocations = true;
					LocationDAO locationDAO = DAOFactory.createLocationDAO(CopyOfLocationUpdateService.this.getApplicationContext());
					com.bri8.cordova.bgloc.data.Location[] allLocations = locationDAO.getAllLocations();
					if (allLocations != null)
						Log.i(TAG, "\t\t Found locations to post:  " + allLocations.length);

					for (com.bri8.cordova.bgloc.data.Location savedLocation : allLocations) {
						Log.d(TAG, "Posting saved location");
						if (postLocation(savedLocation, locationDAO)) {
							locationDAO.deleteLocation(savedLocation);
						}
					}
					Log.i(TAG, "\t\t\t Calling turn off GPS isGpsTurnedOnbyUser : " + isGpsTurnedOnbyUser + ",turnGpsOnAutomatically : " + turnGpsOnAutomatically);
					if (false == isGpsTurnedOnbyUser && turnGpsOnAutomatically) {
						Log.i(TAG, "\t\t\t Calling turn off GPS");
						turnGPSOff();
					}
				}else{
					Log.i(TAG,"***Not Posting location to server as isPostingLocations : "+ isPostingLocations);
				}
			}catch (Exception e) {
				e.printStackTrace();
				Log.i(TAG, "\t\t\t Failed : "+ e.getMessage());
            }finally{
            	isPostingLocations = false;
            }
            return true;
        }
        @Override
        protected void onPostExecute(Boolean result) {
            Log.d(TAG, "PostLocationTask#onPostExecture");
        }
    }


}
