
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

export const saveUserPersona = (persona: string) => localStorage.setItem('koda_persona', persona);
export const getUserPersona = () => localStorage.getItem('koda_persona') || 'Coach Kai';
