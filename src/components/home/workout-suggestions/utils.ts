
import { WorkoutSuggestion } from "./types";
import { Workout } from "@/pages/WorkoutTracker";

export const convertToTrackerWorkout = (workout: WorkoutSuggestion): Omit<Workout, "id"> => {
  // Convert duration string to minutes (assuming format like "30 minutes")
  const durationMatch = workout.duration.match(/(\d+)/);
  const durationMinutes = durationMatch ? parseInt(durationMatch[1]) : 30;
  
  // Create a new workout object in the format expected by the tracker
  return {
    name: workout.name,
    type: workout.difficulty === "Beginner" ? "Flexibility" : 
          workout.difficulty === "Moderate" ? "Cardio" : "Strength",
    duration: durationMinutes,
    calories: workout.caloriesBurned,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5)
  };
};
