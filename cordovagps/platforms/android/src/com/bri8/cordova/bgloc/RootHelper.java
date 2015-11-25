package com.bri8.cordova.bgloc;

import java.io.DataOutputStream;
import java.io.File;
import java.io.IOException;

import android.content.Context;
import android.net.ConnectivityManager;
import android.provider.Settings;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.widget.Toast;

public class RootHelper {
	private static final String TAG = "LocationUpdateService";

	public static void grantSecureSettings(Context context) {
			Log.i(TAG, "Called grantSecureSettings:");
			String command = "pm grant " + context.getPackageName() + " android.permission.WRITE_SECURE_SETTINGS";
			runAsRoot(new String[] {command});
			Settings.Secure.putString(context.getContentResolver(), Settings.Secure.LOCATION_PROVIDERS_ALLOWED, "network,gps");
	}

	public static boolean isRooted() {
		String buildTags = android.os.Build.TAGS;
		if (buildTags != null && buildTags.contains("test-keys")) {
			return true;
		}

		try {
			File file = new File("/system/app/Superuser.apk");
			File fileKingo = new File("/system/app/KingoUser.apk");
			File fileSSu = new File("/system/app/eu.chainfire.supersu-2.apk");
			if (file.exists() || fileKingo.exists() || fileSSu.exists()) { // check if /system/app/*user.apk is present
				Log.i(TAG, "Done calling isRooted() superuser file check : true");
				return true;
			}
		} catch (Exception e1) {
			e1.printStackTrace();
		}
		boolean isRootedTest= findBinary("su");
	    
		if(isRootedTest ==false){
			isRootedTest = canExecuteCommand("/system/xbin/which su") || canExecuteCommand("/system/bin/which su") || canExecuteCommand("which su");
		}
		Log.i(TAG, "Done calling isRooted() : " + isRootedTest);
		return isRootedTest;
	}
	
	public static boolean findBinary(String binaryName) {
	    boolean found = false;
	    if (!found) {
	        String[] places = { "/sbin/", "/system/bin/", "/system/xbin/", "/data/local/xbin/",
	                "/data/local/bin/", "/system/sd/xbin/", "/system/bin/failsafe/", "/data/local/"};
	      
	        for (String where : places) {
	            String path = where + binaryName;
	            Log.i(TAG,"checking if root binary found under : " +path);
				if ( new File( path ).exists() ) {
	                found = true;
	                break;
	            }
	        }
	    }
	    return found;
	}

	public static void runAsRoot(String[] cmds) {
		try {
			Process p = Runtime.getRuntime().exec("su");
			DataOutputStream os = new DataOutputStream(p.getOutputStream());
			for (String tmpCmd : cmds) {
				Log.i(TAG, "Calling root command : " + tmpCmd);
				os.writeBytes(tmpCmd + "\n");
			}
			os.writeBytes("exit\n");
			os.flush();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private static boolean canExecuteCommand(String command) {
		boolean executedSuccesfully;
		try {
			Runtime.getRuntime().exec(command);
			executedSuccesfully = true;
		} catch (Exception e) {
			executedSuccesfully = false;
		}
		Log.i(TAG, "Done calling canExecuteCommand : " + command + " = " + executedSuccesfully);
		return executedSuccesfully;
	}

	public static void setMobileDataEnabled(Context context, boolean enableInternet) {
		try {
			Log.i(TAG, "  \t\tCalled setMobileDataEnabled() : " + enableInternet);

			if (isRooted()) {
				Log.i(TAG, "  \t\t\t Using root command 'settings put' to turn on Internet : " + enableInternet);
				int enableOrDisable = enableInternet ? 1 : 0;
				String enableOrDisableStr = enableInternet ? "enable" : "disable";
				String command = "settings put global mobile_data " + enableOrDisable;
				String command2 = "svc data "+enableOrDisableStr;
				runAsRoot(new String[] {command2});
			} else {
				Log.i(TAG, "  \t\t\t Using reflection to turn on Internet : " + enableInternet);
				final ConnectivityManager conman = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
				final Class conmanClass = Class.forName(conman.getClass().getName());
				final java.lang.reflect.Field connectivityManagerField = conmanClass.getDeclaredField("mService");
				connectivityManagerField.setAccessible(true);
				final Object connectivityManager = connectivityManagerField.get(conman);
				final Class connectivityManagerClass = Class.forName(connectivityManager.getClass().getName());
				final java.lang.reflect.Method setMobileDataEnabledMethod = connectivityManagerClass.getDeclaredMethod("setMobileDataEnabled", Boolean.TYPE);
				setMobileDataEnabledMethod.setAccessible(true);
				setMobileDataEnabledMethod.invoke(connectivityManager, enableInternet);
				Log.i(TAG, "  \t\t\t Done calling Using reflection to turn on Internet ");
			}

		} catch (Exception e) {
			e.printStackTrace();

		}
	}
}
