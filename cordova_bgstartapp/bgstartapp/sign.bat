cmd /c jarsigner -tsa http://timestamp.digicert.com -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore super-gps2.keystore android-release-unsigned.apk  super-gps2
cmd /c D:\Sandeep\JAVA\android-apps\android-sdks\adt-bundle-windows-x86-20130219\sdk\build-tools\22.0.1\zipalign -v -f 4 android-release-unsigned.apk supergps2-0.5.apk
cmd /c D:\Sandeep\JAVA\android-apps\android-sdks\adt-bundle-windows-x86-20130219\sdk\build-tools\22.0.1\zipalign -v -c 4  supergps2-0.5.apk
