
import React from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WorkoutSuggestion } from "./types";
import { WorkoutCard } from "./WorkoutCard";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface SuggestionsDialogProps {
  suggestions: WorkoutSuggestion[];
  currentFitnessLevel: string;
  onTrackWorkout: (workout: WorkoutSuggestion) => void;
  isLoading: boolean;
}

export const SuggestionsDialog: React.FC<SuggestionsDialogProps> = ({
  suggestions,
  currentFitnessLevel,
  onTrackWorkout,
  isLoading,
}) => {
  return (
    <DialogContent className="max-w-md md:max-w-2xl max-h-[85vh] dialog-content">
      <DialogHeader>
        <DialogTitle>{currentFitnessLevel} Workout Suggestions</DialogTitle>
        <DialogDescription>
          Personalized workouts based on your fitness level
        </DialogDescription>
      </DialogHeader>
      
      <ScrollArea className="max-h-[60vh] px-1 -webkit-overflow-scrolling: touch">
        <div className="space-y-4 mt-2 pb-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
              <p className="text-muted-foreground">Generating workout suggestions...</p>
              <div className="w-full space-y-3 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((workout, index) => (
              <WorkoutCard 
                key={workout.id || index} 
                workout={workout} 
                index={index} 
                onTrackWorkout={onTrackWorkout}
                compact={true} 
              />
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No workout suggestions available.</p>
              <p className="text-sm text-muted-foreground mt-1">Try changing your fitness level or preferences.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </DialogContent>
  );
};
