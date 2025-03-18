
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Dumbbell } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { WorkoutSuggestion, WorkoutSuggestionsResponse, fitnessLevels } from "./types";
import { FitnessLevelSelector } from "./FitnessLevelSelector";
import { SuggestionsDialog } from "./SuggestionsDialog";
import { convertToTrackerWorkout } from "./utils";

const WorkoutSuggestions: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentFitnessLevel, setCurrentFitnessLevel] = useState("Beginner");
  const [activeTab, setActiveTab] = useState("beginner");
  
  const fetchSuggestions = async (fitnessLevel: string) => {
    setLoading(true);
    setCurrentFitnessLevel(fitnessLevel);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-workout-suggestions", {
        body: {
          fitnessLevel,
          goalType: "", // Could be populated from user profile
          duration: "", // Could be populated from user preference
          equipment: "", // Could be populated from user profile
          limitations: "" // Could be populated from user profile
        }
      });
      
      if (error) throw error;
      
      const response = data as WorkoutSuggestionsResponse;
      setSuggestions(response.workouts);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching workout suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to get workout suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Find the corresponding fitness level label
    const level = fitnessLevels.find(level => level.id === value);
    if (level) {
      fetchSuggestions(level.label);
    }
  };

  const trackWorkout = (workout: WorkoutSuggestion) => {
    // Convert workout to the format expected by the tracker
    const newWorkout = convertToTrackerWorkout(workout);
    
    // Save workout to localStorage for transfer to the workout tracker
    localStorage.setItem('pendingWorkout', JSON.stringify(newWorkout));
    
    // Close the dialog
    setDialogOpen(false);
    
    // Show toast and navigate to workout tracker
    toast({
      title: "Workout Added to Tracker",
      description: `${workout.name} has been added to your workout tracker.`,
    });
    
    navigate('/workout');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-purple-500" />
              Workout Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FitnessLevelSelector 
              fitnessLevels={fitnessLevels}
              activeTab={activeTab}
              loading={loading}
              onTabChange={handleTabChange}
              onFetchSuggestions={fetchSuggestions}
            />
          </CardContent>
        </Card>
        
        {dialogOpen && (
          <SuggestionsDialog
            suggestions={suggestions}
            currentFitnessLevel={currentFitnessLevel}
            onTrackWorkout={trackWorkout}
          />
        )}
      </Dialog>
    </motion.div>
  );
};

export default WorkoutSuggestions;
