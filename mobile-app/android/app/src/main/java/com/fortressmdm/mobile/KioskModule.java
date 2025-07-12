package com.fortressmdm.mobile;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class KioskModule extends ReactContextBaseJavaModule {
    private static final String TAG = "KioskModule";
    private ReactApplicationContext reactContext;

    public KioskModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "KioskModule";
    }

    @ReactMethod
    public void enterKioskMode(String appPackage, Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                promise.reject("ERROR", "No current activity");
                return;
            }

            // Enable immersive mode
            View decorView = currentActivity.getWindow().getDecorView();
            int uiOptions = View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
            decorView.setSystemUiVisibility(uiOptions);

            // Prevent status bar pull-down
            currentActivity.getWindow().setFlags(
                    WindowManager.LayoutParams.FLAG_FULLSCREEN,
                    WindowManager.LayoutParams.FLAG_FULLSCREEN);

            // Start lock task mode for supported devices
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                ActivityManager activityManager = (ActivityManager) reactContext.getSystemService(Context.ACTIVITY_SERVICE);
                if (activityManager != null) {
                    try {
                        currentActivity.startLockTask();
                        Log.d(TAG, "Lock task mode started");
                    } catch (Exception e) {
                        Log.w(TAG, "Failed to start lock task mode: " + e.getMessage());
                    }
                }
            }

            // Launch specific app if package name provided
            if (appPackage != null && !appPackage.isEmpty()) {
                launchApp(appPackage);
            }

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void exitKioskMode(Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                promise.reject("ERROR", "No current activity");
                return;
            }

            // Exit lock task mode
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                try {
                    currentActivity.stopLockTask();
                    Log.d(TAG, "Lock task mode stopped");
                } catch (Exception e) {
                    Log.w(TAG, "Failed to stop lock task mode: " + e.getMessage());
                }
            }

            // Restore normal UI
            View decorView = currentActivity.getWindow().getDecorView();
            decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);

            // Clear fullscreen flag
            currentActivity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void launchApp(String packageName, Promise promise) {
        try {
            launchApp(packageName);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    private void launchApp(String packageName) {
        try {
            PackageManager packageManager = reactContext.getPackageManager();
            Intent intent = packageManager.getLaunchIntentForPackage(packageName);
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                Log.d(TAG, "Launched app: " + packageName);
            } else {
                Log.w(TAG, "App not found: " + packageName);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to launch app: " + e.getMessage());
        }
    }

    @ReactMethod
    public void isInKioskMode(Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                promise.resolve(false);
                return;
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                ActivityManager activityManager = (ActivityManager) reactContext.getSystemService(Context.ACTIVITY_SERVICE);
                if (activityManager != null) {
                    int lockTaskModeState = activityManager.getLockTaskModeState();
                    boolean isInKioskMode = lockTaskModeState == ActivityManager.LOCK_TASK_MODE_LOCKED;
                    promise.resolve(isInKioskMode);
                    return;
                }
            }

            promise.resolve(false);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void preventSystemUI(boolean prevent, Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                promise.reject("ERROR", "No current activity");
                return;
            }

            if (prevent) {
                // Hide system UI
                View decorView = currentActivity.getWindow().getDecorView();
                int uiOptions = View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
                decorView.setSystemUiVisibility(uiOptions);
            } else {
                // Show system UI
                View decorView = currentActivity.getWindow().getDecorView();
                decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
            }

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}