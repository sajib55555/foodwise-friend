
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Dumbbell, Clock } from "lucide-react";
import { WorkoutSuggestion } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkoutCardProps {
  workout: WorkoutSuggestion;
  index: number;
  onTrackWorkout: (workout: WorkoutSuggestion) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, index, onTrackWorkout }) => {
  const isMobile = useIsMobile();
  
  return (
    <Card key={index} className="overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{workout.name}</CardTitle>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Clock className="h-4 w-4" />
            {workout.duration}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground">{workout.description}</p>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="py-1 px-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs">
            {workout.difficulty}
          </div>
          <div className="py-1 px-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs">
            ~{workout.caloriesBurned} kcal
          </div>
        </div>
        
        <div className="mt-2">
          <h4 className="text-xs uppercase tracking-wider font-semibold mb-2 text-muted-foreground">Exercises</h4>
          <ul className="grid grid-cols-1 gap-y-1">
            {Array.isArray(workout.exercises) && workout.exercises.map((exercise, i) => (
              <li key={i} className="text-sm flex items-center gap-1 p-2 bg-background/50 rounded-md">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-1"></span>
                {typeof exercise === 'string' ? exercise : exercise.name}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex justify-center w-full mt-4">
          <Button 
            size={isMobile ? "sm" : "default"}
            variant="purple-gradient" 
            className="gap-1 w-full md:w-auto"
            onClick={() => onTrackWorkout(workout)}
          >
            <Dumbbell className="h-3.5 w-3.5" />
            Track Workout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
