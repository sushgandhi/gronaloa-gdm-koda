
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HealthMetrics } from '../types';

export const getSimulatedHealthData = (): HealthMetrics => {
  return {
    steps: Math.floor(Math.random() * 5000) + 3000,
    sleepHours: parseFloat((Math.random() * 3 + 5).toFixed(1)),
    heartRate: Math.floor(Math.random() * 20) + 65,
    caloriesBurned: Math.floor(Math.random() * 400) + 1800,
    bloodPressure: `${Math.floor(Math.random() * 20) + 110}/${Math.floor(Math.random() * 10) + 70}`,
    glucose: Math.floor(Math.random() * 20) + 85,
  };
};

export const saveUserPersona = async (persona: string) => {
  try {
    await AsyncStorage.setItem('koda_persona', persona);
  } catch (e) {
    console.error('Failed to save persona', e);
  }
};

export const getUserPersona = async (): Promise<string> => {
  try {
    const value = await AsyncStorage.getItem('koda_persona');
    return value || 'Coach Kai';
  } catch (e) {
    return 'Coach Kai';
  }
};
