package com.fortressmdm.mobile;

import android.app.admin.DeviceAdminReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class DeviceAdminReceiver extends android.app.admin.DeviceAdminReceiver {
    private static final String TAG = "FortressMDM";

    @Override
    public void onEnabled(Context context, Intent intent) {
        super.onEnabled(context, intent);
        Log.d(TAG, "Device admin enabled");
    }

    @Override
    public CharSequence onDisableRequested(Context context, Intent intent) {
        Log.d(TAG, "Device admin disable requested");
        return "Warning: Disabling device admin will remove MDM management capabilities";
    }

    @Override
    public void onDisabled(Context context, Intent intent) {
        super.onDisabled(context, intent);
        Log.d(TAG, "Device admin disabled");
    }

    @Override
    public void onLockTaskModeEntering(Context context, Intent intent, String pkg) {
        super.onLockTaskModeEntering(context, intent, pkg);
        Log.d(TAG, "Entering lock task mode: " + pkg);
    }

    @Override
    public void onLockTaskModeExiting(Context context, Intent intent) {
        super.onLockTaskModeExiting(context, intent);
        Log.d(TAG, "Exiting lock task mode");
    }
}