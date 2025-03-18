
import React from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkoutSuggestion } from "./types";
import { WorkoutCard } from "./WorkoutCard";

interface SuggestionsDialogProps {
  suggestions: WorkoutSuggestion[];
  currentFitnessLevel: string;
  onTrackWorkout: (workout: WorkoutSuggestion) => void;
}

export const SuggestionsDialog: React.FC<SuggestionsDialogProps> = ({
  suggestions,
  currentFitnessLevel,
  onTrackWorkout,
}) => {
  return (
    <DialogContent className="max-w-md md:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{currentFitnessLevel} Workout Suggestions</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6 mt-4">
        {suggestions.map((workout, index) => (
          <WorkoutCard 
            key={index} 
            workout={workout} 
            index={index} 
            onTrackWorkout={onTrackWorkout} 
          />
        ))}
      </div>
    </DialogContent>
  );
};
