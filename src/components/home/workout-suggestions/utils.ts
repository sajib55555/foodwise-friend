
import { WorkoutSuggestion, Workout } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const suggestedWorkouts: Workout[] = [];

// This function will fetch real workout suggestions from the database
export const fetchSuggestedWorkouts = async (userId: string): Promise<Workout[]> => {
  try {
    const { data, error } = await supabase
      .from('user_workout_suggestions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching workout suggestions:', error);
      return [];
    }
    
    if (data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        level: item.level || 'beginner',
        category: item.category || 'strength',
        duration: item.duration || '30 minutes',
        caloriesBurned: item.calories_burned || 250,
        difficulty: item.difficulty || 'Beginner',
        exercises: item.exercises || [
          { name: "Example Exercise", sets: "3", reps: "10" }
        ]
      }));
    }
    
    return [];
  } catch (err) {
    console.error('Failed to fetch workout suggestions:', err);
    return [];
  }
};

export const convertToTrackerWorkout = (workout: WorkoutSuggestion) => {
  // Convert duration string to minutes (assuming format like "30 minutes")
  const durationMatch = workout.duration.match(/(\d+)/);
  const durationMinutes = durationMatch ? parseInt(durationMatch[1]) : 30;
  
  // Create a new workout object in the format expected by the tracker
  return {
    name: workout.name,
    type: workout.difficulty === "Beginner" ? "Flexibility" : 
          workout.difficulty === "Moderate" ? "Cardio" : "Strength",
    duration: durationMinutes.toString(), // Convert to string to fix type mismatch
    calories: workout.caloriesBurned,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5)
  };
};
