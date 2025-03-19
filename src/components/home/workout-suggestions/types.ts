
export interface Exercise {
  name: string;
  reps?: string;
  sets?: string;
  duration?: string;
}

export interface WorkoutSuggestion {
  name: string;
  description: string;
  exercises: string[] | Exercise[];
  caloriesBurned: number;
  difficulty: string;
  duration: string;
}

export interface WorkoutSuggestionsResponse {
  workouts: WorkoutSuggestion[];
}

export type FitnessLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface Workout {
  id: string;
  name: string;
  description: string;
  level: FitnessLevel;
  category: string;
  duration: string;
  caloriesBurned: number;
  exercises: Exercise[];
}

export interface FitnessLevelInfo {
  id: FitnessLevel;
  label: string;
  description: string;
}

export const fitnessLevels: FitnessLevelInfo[] = [
  { id: "beginner", label: "Beginner", description: "New to working out or returning after a long break" },
  { id: "intermediate", label: "Intermediate", description: "Regular workout routine for at least 3 months" },
  { id: "advanced", label: "Advanced", description: "Consistently working out for over a year" },
  { id: "expert", label: "Expert", description: "Highly trained with extensive fitness knowledge" }
];
