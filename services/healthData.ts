import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';
import { HealthMetrics, MealLog, DailyBriefing } from '../types';

const METRICS_KEY = 'koda_metrics';
const PERSONA_KEY = 'koda_persona';
const MEALS_KEY = 'koda_meals';
const BRIEFING_KEY = 'koda_briefing';

// Helper to check if user is logged in
// TEMPORARY: Hardcoded user for development without Firebase
const getUser = () => ({
  uid: 'mock-user-id-sushant',
  displayName: 'Sushant Gandhi',
  email: 'sushant@example.com',
  photoURL: null
});

// const getUser = () => auth?.currentUser;

// --- Health Metrics ---

const generateRandomMetrics = (): HealthMetrics => ({
  steps: Math.floor(Math.random() * 5000) + 3000,
  sleepHours: parseFloat((Math.random() * 3 + 5).toFixed(1)),
  heartRate: Math.floor(Math.random() * 20) + 65,
  caloriesBurned: Math.floor(Math.random() * 400) + 1800,
  bloodPressure: `${Math.floor(Math.random() * 20) + 110}/${Math.floor(Math.random() * 10) + 70}`,
  glucose: Math.floor(Math.random() * 20) + 85,
});

export const getHealthMetrics = async (): Promise<HealthMetrics> => {
  const user = getUser();
  const today = new Date().toISOString().split('T')[0];

  // Cloud Strategy: DISABLED for now
  if (false && user && db) {
    try {
      const docRef = db.collection('users').doc(user.uid).collection('daily_metrics').doc(today);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        return docSnap.data() as HealthMetrics;
      } else {
        // Generate and save if missing
        const newMetrics = generateRandomMetrics();
        await docRef.set(newMetrics);
        return newMetrics;
      }
    } catch (e) {
      console.error("Firestore Error (Metrics):", e);
      return generateRandomMetrics();
    }
  } else {
    // Local Strategy
    try {
      const saved = await AsyncStorage.getItem(`${METRICS_KEY}_${today}`);
      if (saved) return JSON.parse(saved);
      
      const newMetrics = generateRandomMetrics();
      await AsyncStorage.setItem(`${METRICS_KEY}_${today}`, JSON.stringify(newMetrics));
      return newMetrics;
    } catch (e) {
      return generateRandomMetrics();
    }
  }
};

// --- Persona ---

export const saveUserPersona = async (persona: string) => {
  const user = getUser();
  try {
    if (false && user && db) {
      await db.collection('users').doc(user.uid).set({ persona }, { merge: true });
    }
    await AsyncStorage.setItem(PERSONA_KEY, persona);
  } catch (e) {
    console.error('Failed to save persona', e);
  }
};

export const getUserPersona = async (): Promise<string> => {
  const user = getUser();
  try {
    if (false && user && db) {
      const docSnap = await db.collection('users').doc(user.uid).get();
      if (docSnap.exists && docSnap.data()?.persona) {
        // Sync cloud to local
        const p = docSnap.data()!.persona;
        await AsyncStorage.setItem(PERSONA_KEY, p);
        return p;
      }
    }
    const value = await AsyncStorage.getItem(PERSONA_KEY);
    return value || 'Coach Kai';
  } catch (e) {
    return 'Coach Kai';
  }
};

// --- Meals ---

export const saveMealLog = async (meal: MealLog) => {
  const user = getUser();
  if (false && user && db) {
    try {
      await db.collection('users').doc(user.uid).collection('meals').add(meal);
    } catch (e) {
      console.error("Failed to save meal to cloud", e);
    }
  }
  
  // Always save local for offline support/speed
  try {
    const existing = await AsyncStorage.getItem(MEALS_KEY);
    const meals = existing ? JSON.parse(existing) : [];
    meals.unshift(meal);
    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  } catch (e) {
    console.error("Failed to save meal locally", e);
  }
};

export const getMealLogs = async (): Promise<MealLog[]> => {
  const user = getUser();
  if (false && user && db) {
    try {
      const snapshot = await db.collection('users').doc(user.uid).collection('meals')
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();
      return snapshot.docs.map(d => d.data() as MealLog);
    } catch (e) {
      console.error("Failed to fetch cloud meals", e);
    }
  }

  // Fallback to local
  const value = await AsyncStorage.getItem(MEALS_KEY);
  return value ? JSON.parse(value) : [];
};

// --- Daily Briefing ---

export const getStoredBriefing = async (): Promise<DailyBriefing | null> => {
  const user = getUser();
  const today = new Date().toISOString().split('T')[0];

  if (false && user && db) {
    try {
      const docSnap = await db.collection('users').doc(user.uid).collection('briefings').doc(today).get();
      if (docSnap.exists) return docSnap.data() as DailyBriefing;
    } catch (e) {
      console.error("Cloud briefing fetch failed", e);
    }
  }

  const saved = await AsyncStorage.getItem(`${BRIEFING_KEY}_${today}`);
  return saved ? JSON.parse(saved) : null;
};

export const saveBriefing = async (briefing: DailyBriefing) => {
  const user = getUser();
  const today = new Date().toISOString().split('T')[0];

  if (false && user && db) {
    try {
      await db.collection('users').doc(user.uid).collection('briefings').doc(today).set(briefing);
    } catch (e) {
      console.error("Cloud briefing save failed", e);
    }
  }
  
  await AsyncStorage.setItem(`${BRIEFING_KEY}_${today}`, JSON.stringify(briefing));
};