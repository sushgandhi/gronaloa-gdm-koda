
export enum Persona {
  COACH = 'Coach Kai',
  SCIENTIST = 'Dr. Sarah',
  FRIEND = 'Friendly Finn'
}

export interface HealthMetrics {
  steps: number;
  sleepHours: number;
  heartRate: number;
  caloriesBurned: number;
  bloodPressure: string;
  glucose: number;
}

export interface MealLog {
  id: string;
  timestamp: number;
  imageUrl?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  alternatives: string[];
}

export interface DailyBriefing {
  summary: string;
  plan: string[];
  tips: string[];
}

export interface NearbySuggestion {
  name: string;
  type: 'grocery' | 'restaurant';
  address: string;
  recommendation: string;
  link: string;
}
