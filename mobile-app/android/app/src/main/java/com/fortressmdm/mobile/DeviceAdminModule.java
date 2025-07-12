package com.fortressmdm.mobile;

import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.PowerManager;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class DeviceAdminModule extends ReactContextBaseJavaModule {
    private static final String TAG = "DeviceAdminModule";
    private DevicePolicyManager devicePolicyManager;
    private ComponentName adminComponent;
    private ReactApplicationContext reactContext;

    public DeviceAdminModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.devicePolicyManager = (DevicePolicyManager) reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE);
        this.adminComponent = new ComponentName(reactContext, DeviceAdminReceiver.class);
    }

    @Override
    public String getName() {
        return "DeviceAdminModule";
    }

    @ReactMethod
    public void isDeviceAdmin(Promise promise) {
        try {
            boolean isAdmin = devicePolicyManager.isAdminActive(adminComponent);
            promise.resolve(isAdmin);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void requestDeviceAdmin(Promise promise) {
        try {
            Intent intent = new Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);
            intent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent);
            intent.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, 
                "Enable device admin to allow MDM management");
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void lockDevice(Promise promise) {
        try {
            if (devicePolicyManager.isAdminActive(adminComponent)) {
                devicePolicyManager.lockNow();
                promise.resolve(true);
            } else {
                promise.reject("ERROR", "Device admin not active");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void rebootDevice(Promise promise) {
        try {
            if (devicePolicyManager.isAdminActive(adminComponent)) {
                // For security reasons, device reboot requires system-level permissions
                // This is typically handled by the device owner app
                PowerManager powerManager = (PowerManager) reactContext.getSystemService(Context.POWER_SERVICE);
                powerManager.reboot("MDM Remote Reboot");
                promise.resolve(true);
            } else {
                promise.reject("ERROR", "Device admin not active");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void wipeDevice(Promise promise) {
        try {
            if (devicePolicyManager.isAdminActive(adminComponent)) {
                devicePolicyManager.wipeData(DevicePolicyManager.WIPE_EXTERNAL_STORAGE);
                promise.resolve(true);
            } else {
                promise.reject("ERROR", "Device admin not active");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void setPasswordQuality(int quality, Promise promise) {
        try {
            if (devicePolicyManager.isAdminActive(adminComponent)) {
                devicePolicyManager.setPasswordQuality(adminComponent, quality);
                promise.resolve(true);
            } else {
                promise.reject("ERROR", "Device admin not active");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void setMaxFailedPasswordsForWipe(int maxFailures, Promise promise) {
        try {
            if (devicePolicyManager.isAdminActive(adminComponent)) {
                devicePolicyManager.setMaximumFailedPasswordsForWipe(adminComponent, maxFailures);
                promise.resolve(true);
            } else {
                promise.reject("ERROR", "Device admin not active");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void setCameraDisabled(boolean disabled, Promise promise) {
        try {
            if (devicePolicyManager.isAdminActive(adminComponent)) {
                devicePolicyManager.setCameraDisabled(adminComponent, disabled);
                promise.resolve(true);
            } else {
                promise.reject("ERROR", "Device admin not active");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}