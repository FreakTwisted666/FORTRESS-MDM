import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import MDMService, { DeviceStatus } from '../services/MDMService';
import DeviceInfo from 'react-native-device-info';

interface DashboardScreenProps {
  onUnenroll: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onUnenroll }) => {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDeviceStatus();
  }, []);

  const loadDeviceStatus = async () => {
    try {
      const mdmService = MDMService.getInstance();
      // Get device info from the service
      const status = await mdmService.getDeviceInfo();
      setDeviceStatus(status);
    } catch (error) {
      console.error('Failed to load device status:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDeviceStatus();
  };

  const handleUnenroll = () => {
    Alert.alert(
      'Unenroll Device',
      'Are you sure you want to unenroll this device? This will remove all MDM management.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unenroll', style: 'destructive', onPress: confirmUnenroll },
      ]
    );
  };

  const confirmUnenroll = async () => {
    try {
      const mdmService = MDMService.getInstance();
      const success = await mdmService.unenrollDevice();
      
      if (success) {
        Alert.alert('Success', 'Device unenrolled successfully!', [
          { text: 'OK', onPress: onUnenroll }
        ]);
      } else {
        Alert.alert('Error', 'Failed to unenroll device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error during unenrollment.');
    }
  };

  const formatLastSeen = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusColor = (isOnline: boolean): string => {
    return isOnline ? '#10b981' : '#ef4444';
  };

  const getStatusText = (isOnline: boolean): string => {
    return isOnline ? 'Online' : 'Offline';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading device status...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Fortress MDM</Text>
        <Text style={styles.subtitle}>Device Dashboard</Text>
      </View>

      {deviceStatus && (
        <View style={styles.content}>
          {/* Device Status Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Device Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(deviceStatus.isOnline) }]}>
                <Text style={styles.statusText}>{getStatusText(deviceStatus.isOnline)}</Text>
              </View>
            </View>
            
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Device Name</Text>
                <Text style={styles.infoValue}>{deviceStatus.deviceName}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>IMEI</Text>
                <Text style={styles.infoValue}>{deviceStatus.imei}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Serial Number</Text>
                <Text style={styles.infoValue}>{deviceStatus.serialNumber}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Seen</Text>
                <Text style={styles.infoValue}>{formatLastSeen(deviceStatus.lastSeen)}</Text>
              </View>
            </View>
          </View>

          {/* System Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>System Information</Text>
            
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>OS Version</Text>
                <Text style={styles.infoValue}>Android {deviceStatus.osVersion}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>App Version</Text>
                <Text style={styles.infoValue}>{deviceStatus.appVersion}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Battery Level</Text>
                <Text style={styles.infoValue}>{deviceStatus.batteryLevel}%</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>WiFi Status</Text>
                <Text style={styles.infoValue}>{deviceStatus.wifiEnabled ? 'Enabled' : 'Disabled'}</Text>
              </View>
            </View>
          </View>

          {/* Kiosk Mode Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kiosk Mode</Text>
            
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[styles.infoValue, { color: deviceStatus.isKioskMode ? '#10b981' : '#6b7280' }]}>
                  {deviceStatus.isKioskMode ? 'Active' : 'Inactive'}
                </Text>
              </View>
              
              <Text style={styles.infoDescription}>
                {deviceStatus.isKioskMode
                  ? 'Device is currently in kiosk mode. Access to system settings and other apps is restricted.'
                  : 'Device is operating in normal mode with full functionality.'}
              </Text>
            </View>
          </View>

          {/* Location Card */}
          {deviceStatus.location && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Location</Text>
              
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Latitude</Text>
                  <Text style={styles.infoValue}>{deviceStatus.location.latitude.toFixed(6)}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Longitude</Text>
                  <Text style={styles.infoValue}>{deviceStatus.location.longitude.toFixed(6)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleRefresh}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Refresh Status
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={handleUnenroll}
            >
              <Text style={styles.buttonText}>Unenroll Device</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
  },
  actions: {
    gap: 12,
    marginTop: 20,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#2563eb',
  },
});

export default DashboardScreen;