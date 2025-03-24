
import { WorkoutSuggestion, Workout } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const suggestedWorkouts: Workout[] = [];

// This function will fetch workout suggestions from user activity logs
export const fetchSuggestedWorkouts = async (userId: string): Promise<Workout[]> => {
  try {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', 'workout_suggestion')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching workout suggestions:', error);
      return [];
    }
    
    if (data && data.length > 0) {
      return data.map((item: any) => {
        const metadata = item.metadata || {};
        return {
          id: item.id,
          name: metadata.name || 'Workout',
          description: metadata.description || 'No description available',
          level: metadata.level || 'beginner',
          category: metadata.category || 'strength',
          duration: metadata.duration || '30 minutes',
          caloriesBurned: metadata.calories_burned || 250,
          difficulty: metadata.difficulty || 'Beginner',
          exercises: metadata.exercises || [
            { name: "Example Exercise", sets: "3", reps: "10" }
          ]
        };
      });
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
