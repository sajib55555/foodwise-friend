
export interface Reminder {
  id: number;
  user_id: string;
  title: string;
  body: string;
  time: string;
  days: string[];
  active: boolean;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  push_enabled: boolean;
  meal_reminders: boolean;
  water_reminders: boolean;
  workout_reminders: boolean;
  email_enabled: boolean;
  weekly_summary: boolean;
  app_updates: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  gender: string | null;
  age: number | null;
  weight: number | null;
  height: number | null;
  activity_level: string | null;
  fitness_goal: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserMacro {
  id: string;
  user_id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  calculation_method: string | null;
  created_at: string;
}

export interface DeviceToken {
  id: string;
  user_id: string;
  token: string;
  created_at: string;
}
