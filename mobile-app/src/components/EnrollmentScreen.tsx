import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import MDMService from '../services/MDMService';

interface EnrollmentScreenProps {
  onEnrollmentComplete: () => void;
}

const EnrollmentScreen: React.FC<EnrollmentScreenProps> = ({ onEnrollmentComplete }) => {
  const [serverUrl, setServerUrl] = useState('');
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEnrollment = async () => {
    if (!serverUrl || !enrollmentCode) {
      Alert.alert('Error', 'Please enter both server URL and enrollment code');
      return;
    }

    setIsLoading(true);
    
    try {
      const mdmService = MDMService.getInstance();
      const success = await mdmService.enrollDevice(serverUrl, enrollmentCode);
      
      if (success) {
        Alert.alert('Success', 'Device enrolled successfully!', [
          { text: 'OK', onPress: onEnrollmentComplete }
        ]);
      } else {
        Alert.alert('Error', 'Failed to enroll device. Please check your credentials.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRCodeScan = () => {
    // Implement QR code scanner for enrollment
    Alert.alert('QR Code Scanner', 'QR code scanning will be implemented here');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fortress MDM</Text>
        <Text style={styles.subtitle}>Device Enrollment</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Server URL</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="https://your-mdm-server.com"
          placeholderTextColor="#999"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Enrollment Code</Text>
        <TextInput
          style={styles.input}
          value={enrollmentCode}
          onChangeText={setEnrollmentCode}
          placeholder="Enter enrollment code"
          placeholderTextColor="#999"
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleEnrollment}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enroll Device</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleQRCodeScan}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Scan QR Code
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Contact your IT administrator for enrollment credentials
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#2563eb',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EnrollmentScreen;