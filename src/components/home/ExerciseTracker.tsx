
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button-custom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Exercise {
  id: number | string;
  name: string;
  duration: number;
  calories: number;
  date: string;
}

const ExerciseTracker = () => {
  const navigate = useNavigate();
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);
  
  // Load exercises from localStorage on component mount
  useEffect(() => {
    const savedExercises = localStorage.getItem('recentExercises');
    if (savedExercises) {
      setRecentExercises(JSON.parse(savedExercises));
    } else {
      // Initial mock data if nothing in localStorage
      const mockExercises = [
        { id: 1, name: "Morning Run", duration: 25, calories: 320, date: "Today, 7:30 AM" },
        { id: 2, name: "Strength Training", duration: 45, calories: 210, date: "Yesterday, 6:15 PM" },
      ];
      setRecentExercises(mockExercises);
      localStorage.setItem('recentExercises', JSON.stringify(mockExercises));
    }
  }, []);

  // Update localStorage whenever workouts change in WorkoutTracker page
  useEffect(() => {
    const handleStorageChange = () => {
      const pendingUpdates = localStorage.getItem('exerciseTrackerUpdated');
      if (pendingUpdates === 'true') {
        // Fetch the updated exercises from WorkoutTracker
        const updatedWorkouts = localStorage.getItem('workouts');
        if (updatedWorkouts) {
          const workouts = JSON.parse(updatedWorkouts);
          // Take the 2 most recent workouts for the dashboard view
          const recentWorkouts = workouts.slice(0, 2).map((workout: any) => ({
            id: workout.id,
            name: workout.name,
            duration: workout.duration,
            calories: workout.calories,
            date: workout.date && workout.time ? 
              new Date(workout.date).toDateString() === new Date().toDateString() ? 
              `Today, ${workout.time}` : `${workout.date}, ${workout.time}` 
              : "Unknown"
          }));
          
          setRecentExercises(recentWorkouts);
          localStorage.setItem('recentExercises', JSON.stringify(recentWorkouts));
        }
        localStorage.setItem('exerciseTrackerUpdated', 'false');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Check on mount too
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card variant="glass" className="border border-orange-300/30 dark:border-orange-800/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-amber-50/20 dark:from-orange-900/10 dark:to-amber-900/5 z-0"></div>
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-orange-400/20 rounded-full blur-xl"></div>
        <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-amber-400/20 rounded-full blur-xl"></div>
        
        <CardHeader className="pb-2 relative z-10">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600 font-bold">
                Exercise Activity
              </span>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 relative z-10"
              onClick={() => navigate("/workout")}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          {recentExercises.length > 0 ? (
            <ul className="space-y-3">
              {recentExercises.map((exercise) => (
                <li 
                  key={exercise.id} 
                  className="p-3 rounded-lg bg-gradient-to-r from-orange-100/60 to-amber-100/40 dark:from-orange-900/20 dark:to-amber-900/10 border border-orange-100/30 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm text-orange-800 dark:text-orange-300">{exercise.name}</h4>
                      <p className="text-xs text-orange-600/70 dark:text-orange-400/70">{exercise.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-300">{exercise.calories} kcal</p>
                      <p className="text-xs text-orange-600/70 dark:text-orange-400/70">{exercise.duration} min</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-orange-600/70 dark:text-orange-400/70 text-sm">No recent exercises</p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="w-full mt-4 border-orange-300 bg-white/70 text-orange-700 hover:bg-orange-50 hover:text-orange-800 transition-all shadow-sm"
            size="sm"
            onClick={() => navigate("/workout")}
          >
            Track New Workout
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExerciseTracker;
