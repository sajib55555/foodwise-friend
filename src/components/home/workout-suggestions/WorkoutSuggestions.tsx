
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Dumbbell, ChevronRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { WorkoutCard } from "./WorkoutCard";
import { SuggestionsDialog } from "./SuggestionsDialog";
import { FitnessLevel, Workout, fitnessLevels } from "./types";
import { suggestedWorkouts } from "./utils";

const WorkoutSuggestions = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>("intermediate");
  const [recommendations, setRecommendations] = useState<Workout[]>(
    suggestedWorkouts.filter((workout) => 
      workout.level === "beginner" || workout.level === "intermediate"
    ).slice(0, 2)
  );

  const handleTrackWorkout = (workout: Workout) => {
    console.log("Tracking workout:", workout);
    // Here you would implement the logic to add this workout to the user's tracker
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
            
            <Button 
              variant="outline" 
              className="w-full mt-2 border-blue-300 bg-white/70 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-all shadow-sm"
              size="sm"
              onClick={() => setShowDialog(true)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Get Personalized Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {showDialog && (
        <SuggestionsDialog 
          suggestions={suggestedWorkouts.filter(workout => workout.level === fitnessLevel)}
          currentFitnessLevel={fitnessLevels.find(level => level.id === fitnessLevel)?.label || ""}
          onTrackWorkout={handleTrackWorkout}
        />
      )}
    </motion.div>
  );
};

export default WorkoutSuggestions;
