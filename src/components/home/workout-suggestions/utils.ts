
import { WorkoutSuggestion, Workout } from "./types";

export const suggestedWorkouts: Workout[] = [
  {
    id: "1",
    name: "Full Body Power",
    description: "A comprehensive full-body workout to build overall strength",
    level: "beginner",
    category: "strength",
    duration: "30 minutes",
    caloriesBurned: 250,
    difficulty: "Beginner",
    exercises: [
      { name: "Push-ups", sets: "3", reps: "10" },
      { name: "Squats", sets: "3", reps: "15" },
      { name: "Plank", duration: "30 seconds" },
      { name: "Lunges", sets: "2", reps: "10 each leg" }
    ]
  },
  {
    id: "2",
    name: "Core Crusher",
    description: "Target your abs and lower back for a stronger core",
    level: "beginner",
    category: "core",
    duration: "20 minutes",
    caloriesBurned: 180,
    difficulty: "Beginner",
    exercises: [
      { name: "Crunches", sets: "3", reps: "15" },
      { name: "Russian Twists", sets: "3", reps: "20" },
      { name: "Leg Raises", sets: "3", reps: "12" },
      { name: "Bird Dogs", sets: "2", reps: "10 each side" }
    ]
  },
  {
    id: "3",
    name: "HIIT Blast",
    description: "High-intensity interval training to maximize calorie burn",
    level: "intermediate",
    category: "cardio",
    duration: "25 minutes",
    caloriesBurned: 300,
    difficulty: "Intermediate",
    exercises: [
      { name: "Jumping Jacks", duration: "45 seconds" },
      { name: "Mountain Climbers", duration: "45 seconds" },
      { name: "Burpees", duration: "30 seconds" },
      { name: "High Knees", duration: "45 seconds" }
    ]
  },
  {
    id: "4",
    name: "Advanced Strength Circuit",
    description: "Challenging workout for experienced fitness enthusiasts",
    level: "advanced",
    category: "strength",
    duration: "45 minutes",
    caloriesBurned: 400,
    difficulty: "Advanced",
    exercises: [
      { name: "Pull-ups", sets: "4", reps: "8-10" },
      { name: "Deadlifts", sets: "4", reps: "8" },
      { name: "Weighted Squats", sets: "4", reps: "10" },
      { name: "Dips", sets: "3", reps: "12" }
    ]
  },
  {
    id: "5",
    name: "Expert Power Training",
    description: "Intensive workout designed for fitness experts",
    level: "expert",
    category: "strength",
    duration: "60 minutes",
    caloriesBurned: 500,
    difficulty: "Expert",
    exercises: [
      { name: "Weighted Pull-ups", sets: "5", reps: "5" },
      { name: "Barbell Squats", sets: "5", reps: "5" },
      { name: "Bench Press", sets: "5", reps: "5" },
      { name: "Olympic Lifts", sets: "4", reps: "3-5" }
    ]
  }
];

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
