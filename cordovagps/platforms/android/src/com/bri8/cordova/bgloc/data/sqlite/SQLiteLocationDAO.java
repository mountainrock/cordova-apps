package com.bri8.cordova.bgloc.data.sqlite;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.TimeZone;
import java.util.List;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.bri8.cordova.bgloc.data.Location;
import com.bri8.cordova.bgloc.data.LocationDAO;

public class SQLiteLocationDAO implements LocationDAO {
	public static final String DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";
	private static final String TAG = "SQLiteLocationDAO";
	private Context context;
	
	public SQLiteLocationDAO(Context context) {
		this.context = context;
	}
	
	public Location[] getAllLocations() {
		SQLiteDatabase db = null;
		Cursor c = null;
		List<Location> all = new ArrayList<Location>();
		try {
			db = new LocationOpenHelper(context).getReadableDatabase();
			c = db.query(LocationOpenHelper.LOCATION_TABLE_NAME, null, null, null, null, null, null);
			while (c.moveToNext()) {
				all.add(hydrate(c));
			}
		} finally {
			if (c != null) {
				c.close();
			}
			if (db != null) {
				db.close();
			}
		}
		return all.toArray(new Location[all.size()]);
	}

	public boolean persistLocation(Location location) {
		SQLiteDatabase db = new LocationOpenHelper(context).getWritableDatabase();
		
		ContentValues values = getContentValues(location);
		String recordedAt = dateToString(location.getRecordedAt());
		
		String[] selectionArgs={recordedAt, location.getLatitude(), location.getLongitude(), location.getAccuracy(), location.getProvider(), location.getSpeed(), location.getBearing(), location.getAltitude()};
		String sqlQueryCheck = String.format("select 1 from  %s where recordedAt =? and latitude =?  and longitude=? and accuracy=? and provider =? and speed=? and bearing=? and altitude=?",LocationOpenHelper.LOCATION_TABLE_NAME);
		Log.i(TAG,"sqlQueryCheck : "+ sqlQueryCheck + Arrays.toString(selectionArgs));
		Cursor cursorCheckQuery = db.rawQuery(sqlQueryCheck, selectionArgs);
		if (cursorCheckQuery.moveToNext()) {
				Log.i(TAG,"\t\t sqlQueryCheck failed duplicate location found. Not saving hence!!");
				cursorCheckQuery.close();
				return false;	
		}else{
			cursorCheckQuery.close();
			Log.i(TAG,"\t\t No duplicates found!!");
		}
		
		db.beginTransaction();
		long rowId = db.insert(LocationOpenHelper.LOCATION_TABLE_NAME, null, values);
		Log.d(TAG, "After insert, rowId = " + rowId);
		db.setTransactionSuccessful();
		db.endTransaction();
		db.close();
		if (rowId > -1) {
			location.setId(rowId);
			return true;
		} else {
			return false;
		}
		
	}
	
	public void deleteLocation(Location location) {
		SQLiteDatabase db = new LocationOpenHelper(context).getWritableDatabase();
		db.beginTransaction();
		db.delete(LocationOpenHelper.LOCATION_TABLE_NAME, "id = ?", new String[]{location.getId().toString()});
		db.setTransactionSuccessful();
		db.endTransaction();
		db.close();
	}
	
	private Location hydrate(Cursor c) {
		Location l = new Location();
		l.setId(c.getLong(c.getColumnIndex("id")));
		l.setRecordedAt(stringToDate(c.getString(c.getColumnIndex("recordedAt"))));
		l.setLatitude(c.getString(c.getColumnIndex("latitude")));
		l.setLongitude(c.getString(c.getColumnIndex("longitude")));
		l.setAccuracy(c.getString(c.getColumnIndex("accuracy")));
		l.setSpeed(c.getString(c.getColumnIndex("speed")));
		l.setAltitude(c.getString(c.getColumnIndex("altitude")));
		l.setBearing(c.getString(c.getColumnIndex("bearing")));
		l.setProvider(c.getString(c.getColumnIndex("provider")));
		
		return l;
	}
	
	private ContentValues getContentValues(Location location) {
		ContentValues values = new ContentValues();
		values.put("latitude", location.getLatitude());
		values.put("longitude", location.getLongitude());
		values.put("recordedAt", dateToString(location.getRecordedAt()));	
		values.put("accuracy",  location.getAccuracy());
		values.put("altitude", location.getAltitude());
		values.put("bearing", location.getBearing());
		values.put("speed", location.getSpeed());
		values.put("provider", location.getProvider());
		return values;
	}
	
	
	public Date stringToDate(String dateTime) {
		TimeZone tz = TimeZone.getTimeZone("UTC");
		SimpleDateFormat iso8601Format = new SimpleDateFormat(DATE_FORMAT);
		iso8601Format.setTimeZone(tz);
		
		Date date = null;
		try {
			date = iso8601Format.parse(dateTime);			
		} catch (ParseException e) {
			Log.e("DBUtil", "Parsing ISO8601 datetime ("+ dateTime +") failed", e);
		}
		return date;
	}
	
	public String dateToString(Date date) {
		TimeZone tz = TimeZone.getTimeZone("UTC");
		SimpleDateFormat iso8601Format = new SimpleDateFormat(DATE_FORMAT);
		iso8601Format.setTimeZone(tz);
		return iso8601Format.format(date);
	}

}
