
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Dumbbell, Clock } from "lucide-react";
import { WorkoutSuggestion } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

interface WorkoutCardProps {
  workout: WorkoutSuggestion;
  index: number;
  onTrackWorkout: (workout: WorkoutSuggestion) => void;
  compact?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ 
  workout, 
  index, 
  onTrackWorkout,
  compact = false 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Card key={index} className={`overflow-hidden ${compact ? 'shadow-sm' : ''}`}>
      <CardHeader className={`${compact ? 'p-3 pb-1' : 'pb-2'} bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10`}>
        <div className="flex justify-between items-start">
          <CardTitle className={compact ? "text-base" : "text-lg"}>{workout.name}</CardTitle>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Clock className="h-3.5 w-3.5" />
            {workout.duration}
          </div>
        </div>
      </CardHeader>
      <CardContent className={compact ? "p-3 space-y-2" : "p-4 space-y-3"}>
        <p className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{workout.description}</p>
        
        <div className="flex flex-wrap gap-1.5 mt-1">
          <Badge variant="outline" className="bg-purple-100/50 dark:bg-purple-900/20 text-xs">
            {workout.difficulty}
          </Badge>
          <Badge variant="outline" className="bg-purple-100/50 dark:bg-purple-900/20 text-xs">
            ~{workout.caloriesBurned} kcal
          </Badge>
        </div>
        
        <div className={compact ? "mt-1" : "mt-2"}>
          <h4 className={`${compact ? 'text-xs mb-1' : 'text-xs mb-2'} uppercase tracking-wider font-semibold text-muted-foreground`}>
            Exercises
          </h4>
          <ul className="grid grid-cols-1 gap-y-1">
            {Array.isArray(workout.exercises) && workout.exercises.map((exercise, i) => (
              <li 
                key={i} 
                className={`${compact ? 'text-xs py-1.5' : 'text-sm py-2'} flex items-center gap-1 px-2 bg-background/50 rounded-md`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-1"></span>
                {typeof exercise === 'string' ? exercise : exercise.name}
              </li>
            ))}
          </ul>
        </div>
        
        <div className={`flex justify-center w-full ${compact ? 'mt-2' : 'mt-4'}`}>
          <Button 
            size={compact || isMobile ? "sm" : "default"}
            variant="purple-gradient" 
            className="gap-1 w-full"
            onClick={() => onTrackWorkout(workout)}
          >
            <Dumbbell className={`${compact || isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
            Track Workout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
