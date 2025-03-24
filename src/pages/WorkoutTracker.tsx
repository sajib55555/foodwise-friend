
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Load workouts from the database
  useEffect(() => {
    async function fetchWorkouts() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('activity_type', 'workout_logged')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching workouts:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedWorkouts: Workout[] = data.map(entry => {
            const metadata = entry.metadata || {};
            const dateObj = new Date(entry.created_at);
            
            return {
              id: entry.id,
              name: metadata.workout_name || 'Workout',
              type: metadata.workout_type || 'Other',
              duration: Number(metadata.duration) || 30,
              calories: Number(metadata.calories) || 0,
              date: dateObj.toISOString().split('T')[0],
              time: dateObj.toTimeString().slice(0, 5)
            };
          });
          
          setWorkouts(formattedWorkouts);
        }
      } catch (error) {
        console.error('Error processing workout data:', error);
        toast({
          title: "Failed to load workout history",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWorkouts();
  }, [user, toast]);

  const addWorkout = async (workout: Omit<Workout, "id">) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to log your workout",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Insert workout into user_activity_logs
      const { data, error } = await supabase
        .from('user_activity_logs')
        .insert([
          {
            user_id: user.id,
            activity_type: 'workout_logged',
            description: `Logged a workout: ${workout.name}`,
            metadata: {
              workout_name: workout.name,
              workout_type: workout.type,
              duration: workout.duration,
              calories: workout.calories
            }
          }
        ])
        .select();
        
      if (error) {
        throw error;
      }
      
      const newWorkout = {
        ...workout,
        id: data?.[0]?.id || Math.random().toString(36).substring(2, 9)
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
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Failed to save workout",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const deleteWorkout = async (id: string) => {
    if (!user) return;
    
    const workoutToDelete = workouts.find(w => w.id === id);
    
    if (!workoutToDelete) return;
    
    try {
      const { error } = await supabase
        .from('user_activity_logs')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setWorkouts(workouts.filter(workout => workout.id !== id));
      
      logActivity('workout_deleted', `Deleted workout: ${workoutToDelete.name}`, {
        workout_name: workoutToDelete.name,
        workout_type: workoutToDelete.type
      });
      
      toast({
        title: "Workout deleted",
        description: "The workout has been removed from your history.",
      });
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast({
        title: "Failed to delete workout",
        description: "Please try again",
        variant: "destructive",
      });
    }
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
                  {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-6 h-6 border-2 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
                    </div>
                  ) : (
                    <WorkoutHistoryList workouts={workouts} onDelete={deleteWorkout} />
                  )}
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
