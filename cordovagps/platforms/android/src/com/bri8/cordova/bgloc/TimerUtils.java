package com.bri8.cordova.bgloc;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import android.util.Log;

public class TimerUtils {

	public static void main(String[] args) {
		String encoded = "9:00 - 21:30,9:00 - 22:30,9:00 - 22:30,9:00 - 22:30,9:00 - 22:30,9:00 - 22:30,9:00 - 21:00";// sunday,monday, tues..
		java.util.Map<Integer, List<String>> workHoursMap = getWorkHoursMap(encoded);
		System.out.println(workHoursMap);
		boolean isTimeInRange= isTimeInRange(workHoursMap);
		System.out.println("isTimeInRange : "+isTimeInRange);

	}

	public static java.util.Map<Integer, List<String>> getWorkHoursMap(String encoded) {
		java.util.Map<Integer, List<String>> workHoursMap = new java.util.LinkedHashMap<Integer, List<String>>();

		String[] tokens = encoded.split(",");
		Integer[] dayOfWeek = { 1, 2, 3, 4, 5, 6, 7 }; // sunday,monday , tues....
		for (int i = 0; i < tokens.length; i++) {
			String[] timeRange = tokens[i].split(" - ");
			workHoursMap.put(dayOfWeek[i], Arrays.asList(timeRange));
		}
		return workHoursMap;
	}

	public static boolean isTimeInRange(java.util.Map<Integer, List<String>> workHoursMap) {
		Log.i(LocationUpdateService.TAG ,"Checking isTimeInRange :"+ workHoursMap);
		Calendar now = Calendar.getInstance();
		int day = now.get(Calendar.DAY_OF_WEEK);
		List<String> timeRange = workHoursMap.get(day);
		
		int currentHour = now.get(Calendar.HOUR_OF_DAY); // Get hour in 24 hour format
		int currentMinute = now.get(Calendar.MINUTE);
		Date date = parseDate(currentHour + ":" + currentMinute);
		Date dateCompareOne = parseDate(timeRange.get(0));
		Date dateCompareTwo = parseDate(timeRange.get(1));
		
		
		boolean isTimeInRange = dateCompareOne.before(date) && dateCompareTwo.after(date);
		Log.i(LocationUpdateService.TAG ,String.format("Checking isTimeInRange : day: %s, today : %s, time start : %s , timeEnd : %s, result : %s",day, date, dateCompareOne, dateCompareTwo , isTimeInRange));

		return isTimeInRange;
	}

	private static Date parseDate(String date) {

		final String inputFormat = "HH:mm";
		SimpleDateFormat inputParser = new SimpleDateFormat(inputFormat, Locale.US);
		try {
			return inputParser.parse(date);
		} catch (java.text.ParseException e) {
			e.printStackTrace();
			return null;
		}
	}

}