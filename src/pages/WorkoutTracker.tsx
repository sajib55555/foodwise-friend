
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Plus, Activity } from "lucide-react";
import WorkoutForm from "@/components/workout/WorkoutForm";
import WorkoutHistoryList from "@/components/workout/WorkoutHistoryList";
import WorkoutStatsCards from "@/components/workout/WorkoutStatsCards";
import { motion } from "framer-motion";
import { useActivityLog } from "@/contexts/ActivityLogContext";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Workout {
  id: string;
  name: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
  time: string;
}

const WorkoutTracker = () => {
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const isMobile = useIsMobile();

  // Load workouts from localStorage on component mount
  useEffect(() => {
    const savedWorkouts = localStorage.getItem('workouts');
    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts));
    } else {
      // Initial mock data if nothing in localStorage
      const initialWorkouts = [
        {
          id: "1",
          name: "Morning Run",
          type: "Cardio",
          duration: 30,
          calories: 320,
          date: new Date().toISOString().split('T')[0],
          time: "08:30"
        },
        {
          id: "2",
          name: "Strength Training",
          type: "Strength",
          duration: 45,
          calories: 210,
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
          time: "18:15"
        }
      ];
      setWorkouts(initialWorkouts);
      localStorage.setItem('workouts', JSON.stringify(initialWorkouts));
    }
    
    const pendingWorkoutString = localStorage.getItem('pendingWorkout');
    
    if (pendingWorkoutString) {
      try {
        const pendingWorkout = JSON.parse(pendingWorkoutString) as Omit<Workout, "id">;
        addWorkout(pendingWorkout);
        localStorage.removeItem('pendingWorkout');
      } catch (error) {
        console.error("Error processing pending workout:", error);
      }
    }
  }, []);

  // Save workouts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('workouts', JSON.stringify(workouts));
    // Notify ExerciseTracker component about updates
    localStorage.setItem('exerciseTrackerUpdated', 'true');
    // Dispatch a storage event to trigger the listener in ExerciseTracker
    window.dispatchEvent(new Event('storage'));
  }, [workouts]);

  const addWorkout = (workout: Omit<Workout, "id">) => {
    const newWorkout = {
      ...workout,
      id: Math.random().toString(36).substring(2, 9)
    };
    setWorkouts([newWorkout, ...workouts]);
    setShowWorkoutForm(false);
    
    logActivity('workout_logged', `Logged a workout: ${workout.name}`, {
      workout_name: workout.name,
      workout_type: workout.type,
      duration: workout.duration,
      calories: workout.calories
    });
    
    toast({
      title: "Workout added",
      description: `${workout.name} has been added to your history.`,
    });
  };

  const deleteWorkout = (id: string) => {
    const workoutToDelete = workouts.find(w => w.id === id);
    setWorkouts(workouts.filter(workout => workout.id !== id));
    
    if (workoutToDelete) {
      logActivity('workout_deleted', `Deleted workout: ${workoutToDelete.name}`, {
        workout_name: workoutToDelete.name,
        workout_type: workoutToDelete.type
      });
    }
    
    toast({
      title: "Workout deleted",
      description: "The workout has been removed from your history.",
    });
  };

  const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0);
  const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const totalWorkouts = workouts.length;

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
        {/* Decorative elements */}
        <div className="absolute top-20 right-5 w-64 h-64 bg-purple-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-5 w-72 h-72 bg-indigo-300/10 rounded-full blur-3xl"></div>
        
        <Header title="Workout Tracker" />
        <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <WorkoutStatsCards 
                totalWorkouts={totalWorkouts} 
                totalCalories={totalCalories} 
                totalDuration={totalDuration} 
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative z-10"
            >
              <Card variant="glass" className="shadow-purple-sm border border-purple-200/50 dark:border-purple-800/30 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-gradient-purple">
                      <Activity className="h-5 w-5 text-purple-500" />
                      Workout History
                    </CardTitle>
                    <Button
                      variant="purple-gradient"
                      size={isMobile ? "pill-sm" : "pill"}
                      className="shadow-purple hover:shadow-purple-lg transition-all"
                      onClick={() => setShowWorkoutForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Workout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <WorkoutHistoryList workouts={workouts} onDelete={deleteWorkout} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
        
        {showWorkoutForm && (
          <WorkoutForm
            onSubmit={addWorkout}
            onCancel={() => setShowWorkoutForm(false)}
          />
        )}
        
        <MobileNavbar />
      </div>
    </PageTransition>
  );
};

export default WorkoutTracker;
