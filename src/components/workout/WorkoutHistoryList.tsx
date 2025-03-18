
import React from "react";
import { Button } from "@/components/ui/button-custom";
import { Workout } from "@/pages/WorkoutTracker";
import { Calendar, Clock, Flame, Dumbbell, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface WorkoutHistoryListProps {
  workouts: Workout[];
  onDelete: (id: string) => void;
}

const WorkoutHistoryList: React.FC<WorkoutHistoryListProps> = ({ workouts, onDelete }) => {
  // Get workout type icon
  const getWorkoutIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "cardio":
        return <Activity className="h-4 w-4 text-red-500" />;
      case "strength":
        return <Dumbbell className="h-4 w-4 text-purple-500" />;
      case "flexibility":
        return <Activity className="h-4 w-4 text-blue-500" />;
      case "balance":
        return <Activity className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-3">
      {workouts.length > 0 ? (
        workouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="p-3 rounded-lg bg-background/50 border border-border hover:bg-background/70 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-primary/10">
                    {getWorkoutIcon(workout.type)}
                  </span>
                  <h4 className="font-medium text-sm">{workout.name}</h4>
                </div>
                
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(workout.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{workout.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    <span>{workout.calories} kcal</span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(workout.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-8">
          <Activity className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
          <p className="text-muted-foreground">No workouts recorded yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Track your first workout to see it here
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkoutHistoryList;
