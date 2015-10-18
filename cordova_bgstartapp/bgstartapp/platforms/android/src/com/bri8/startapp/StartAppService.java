package com.bri8.startapp;

import com.red_folder.phonegap.plugin.backgroundservice.BackgroundService;

import org.json.JSONException;
import org.json.JSONObject;

import android.app.ActivityManager;
import android.app.ActivityManager.RunningServiceInfo;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import java.util.Date;
import java.util.List;

public class StartAppService extends BackgroundService {
	String packageToStart;
	JSONObject config;
	String defaultPkg = "com.bri8.gps";
	@Override
	protected JSONObject doWork() {

		Context ctx = this;
		JSONObject result = new JSONObject();
		try {
			
			Log.i("StartAppService", "packageToStart : " + packageToStart);
			if(packageToStart ==null){
				result.put("Message", "No package name found using default : "+defaultPkg );
				packageToStart =defaultPkg;
			}
			String msg = "";
			if(isServiceRunning(packageToStart) ==false){	// check if package is already started to avoid popup
				Intent i = ctx.getPackageManager().getLaunchIntentForPackage(packageToStart);
				ctx.startActivity(i);
				msg = "StartAppService tried to start package : "+packageToStart+" at " + new Date();
			}else{
				msg ="**Nothing to do. Already running package: " + packageToStart;
			}
			
			Log.i("StartAppService", msg);
			result.put("Message", msg);

		} catch (Exception e) {
			e.printStackTrace();
		}

		return result;
	}
	
	public  boolean isServiceRunning(String packageName){
        final ActivityManager activityManager = (ActivityManager)this.getSystemService(Context.ACTIVITY_SERVICE);
        final List<RunningServiceInfo> services = activityManager.getRunningServices(Integer.MAX_VALUE);

        for (RunningServiceInfo runningServiceInfo : services) {
            if (runningServiceInfo.service.getPackageName().equals(packageName)){
                return true;
            }
        }
        return false;
     }
	

	@Override
	protected JSONObject getConfig() {
		return config;
	}

	@Override
	protected void setConfig(JSONObject config) {
		try {
			Log.i("StartAppService", " Configuring : ");
			packageToStart = config.getString("packageName");// "com.bri8.gps";
			Log.i("StartAppService", " Configured packageToStart : " + packageToStart);
			
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	@Override
	protected JSONObject initialiseLatestResult() {
		return null;
	}

}
