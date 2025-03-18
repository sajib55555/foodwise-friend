
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Plus, Activity, Calendar, Clock, Flame } from "lucide-react";
import WorkoutForm from "@/components/workout/WorkoutForm";
import WorkoutHistoryList from "@/components/workout/WorkoutHistoryList";
import WorkoutStatsCards from "@/components/workout/WorkoutStatsCards";
import { motion } from "framer-motion";

// Workout type definition
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
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([
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
  ]);

  const addWorkout = (workout: Omit<Workout, "id">) => {
    const newWorkout = {
      ...workout,
      id: Math.random().toString(36).substring(2, 9) // Generate a random ID
    };
    setWorkouts([newWorkout, ...workouts]);
    setShowWorkoutForm(false);
    toast({
      title: "Workout added",
      description: `${workout.name} has been added to your history.`,
    });
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(workout => workout.id !== id));
    toast({
      title: "Workout deleted",
      description: "The workout has been removed from your history.",
    });
  };

  // Workout statistics
  const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0);
  const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const totalWorkouts = workouts.length;

  return (
    <PageTransition>
      <Header title="Workout Tracker" />
      <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
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
          >
            <Card variant="glass">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Workout History
                  </CardTitle>
                  <Button
                    variant="purple"
                    size="sm"
                    className="h-8"
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
    </PageTransition>
  );
};

export default WorkoutTracker;
