import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnrollmentScreen from './components/EnrollmentScreen';
import DashboardScreen from './components/DashboardScreen';
import MDMService from './services/MDMService';

const App: React.FC = () => {
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);

  useEffect(() => {
    checkEnrollmentStatus();
  }, []);

  const checkEnrollmentStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('device_token');
      const serverUrl = await AsyncStorage.getItem('server_url');
      setIsEnrolled(!!token && !!serverUrl);
    } catch (error) {
      console.error('Failed to check enrollment status:', error);
      setIsEnrolled(false);
    }
  };

  const handleEnrollmentComplete = () => {
    setIsEnrolled(true);
  };

  const handleUnenroll = () => {
    setIsEnrolled(false);
  };

  if (isEnrolled === null) {
    return null; // Loading state
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      {isEnrolled ? (
        <DashboardScreen onUnenroll={handleUnenroll} />
      ) : (
        <EnrollmentScreen onEnrollmentComplete={handleEnrollmentComplete} />
      )}
    </>
  );
};

export default App;