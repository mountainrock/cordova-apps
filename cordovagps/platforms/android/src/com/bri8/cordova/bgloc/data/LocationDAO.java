package com.bri8.cordova.bgloc.data;

import java.util.Date;

public interface LocationDAO {
    public Location[] getAllLocations();
    public boolean persistLocation(Location l);
    public void deleteLocation(Location l);
    public String dateToString(Date date);
}
