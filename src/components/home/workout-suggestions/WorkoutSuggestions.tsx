
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Dumbbell, ChevronRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { WorkoutCard } from "./WorkoutCard";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { SuggestionsDialog } from "./SuggestionsDialog";
import { FitnessLevel, FitnessLevelInfo, Workout, WorkoutSuggestion, fitnessLevels } from "./types";
import { suggestedWorkouts } from "./utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const WorkoutSuggestions = () => {
  const [open, setOpen] = useState(false);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>("intermediate");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const { toast } = useToast();
  
  // Default recommendations that show on the main view
  const [recommendations, setRecommendations] = useState<WorkoutSuggestion[]>(
    suggestedWorkouts.filter((workout) => 
      workout.level === "beginner" || workout.level === "intermediate"
    ).slice(0, 2).map(workout => ({
      ...workout,
      difficulty: workout.level, // Map level to difficulty
    }))
  );

  const handleTrackWorkout = (workout: WorkoutSuggestion) => {
    console.log("Tracking workout:", workout);
    // Here you would implement the logic to add this workout to the user's tracker
    toast({
      title: "Workout Added",
      description: `${workout.name} has been added to your workout tracker`,
      variant: "default"
    });
  };

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-workout-suggestions', {
        body: {
          fitnessLevel: fitnessLevel,
          goalType: "General fitness",
          duration: "30 minutes",
          equipment: "Minimal",
          limitations: "None"
        }
      });

      if (error) {
        console.error("Error fetching workout suggestions:", error);
        toast({
          title: "Error",
          description: "Failed to get workout suggestions. Please try again.",
          variant: "destructive"
        });
        // Use fallback suggestions from predefined workouts
        setSuggestions(suggestedWorkouts
          .filter(workout => workout.level === fitnessLevel)
          .map(workout => ({
            ...workout,
            difficulty: workout.level,
          })));
      } else {
        console.log("Received workout suggestions:", data);
        // Format the received data to match our WorkoutSuggestion type
        const formattedSuggestions = data.workouts.map((workout: any, index: number) => ({
          id: `generated-${index}`,
          name: workout.name,
          description: workout.description,
          exercises: workout.exercises.map((ex: string) => ({ name: ex })),
          caloriesBurned: workout.caloriesBurned,
          difficulty: workout.difficulty,
          duration: workout.duration
        }));
        setSuggestions(formattedSuggestions);
      }
    } catch (error) {
      console.error("Error in workout suggestion generation:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Using default suggestions instead.",
        variant: "destructive"
      });
      // Use fallback suggestions
      setSuggestions(suggestedWorkouts
        .filter(workout => workout.level === fitnessLevel)
        .map(workout => ({
          ...workout,
          difficulty: workout.level,
        })));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="glass" className="border border-blue-300/30 dark:border-blue-800/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/20 dark:from-blue-900/10 dark:to-indigo-900/5 z-0"></div>
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl"></div>
        
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-base flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 font-bold">
              Workout Suggestions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-3">
            {recommendations.map((workout, index) => (
              <WorkoutCard 
                key={workout.id} 
                workout={workout}
                index={index}
                onTrackWorkout={handleTrackWorkout}
              />
            ))}
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-blue-300 bg-white/70 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-all shadow-sm"
                  size="sm"
                  onClick={() => {
                    // Generate suggestions when the dialog opens
                    handleGetSuggestions();
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get Personalized Suggestions
                </Button>
              </DialogTrigger>
              
              {open && (
                <SuggestionsDialog 
                  suggestions={suggestions}
                  currentFitnessLevel={fitnessLevels.find(level => level.id === fitnessLevel)?.label || ""}
                  onTrackWorkout={handleTrackWorkout}
                  isLoading={isLoading}
                />
              )}
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WorkoutSuggestions;
