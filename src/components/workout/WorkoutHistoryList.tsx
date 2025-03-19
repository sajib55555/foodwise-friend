
import React from "react";
import { Button } from "@/components/ui/button-custom";
import { Workout } from "@/pages/WorkoutTracker";
import { Calendar, Clock, Flame, Dumbbell, Trash2, Activity, Bike, Heart } from "lucide-react";
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
        return <Activity className="h-5 w-5 text-red-500" />;
      case "strength":
        return <Dumbbell className="h-5 w-5 text-purple-500" />;
      case "flexibility":
        return <Heart className="h-5 w-5 text-blue-500" />;
      case "cycling":
        return <Bike className="h-5 w-5 text-green-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get workout type color
  const getWorkoutTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "cardio":
        return "text-red-500 bg-red-100 dark:bg-red-900/30";
      case "strength":
        return "text-purple-500 bg-purple-100 dark:bg-purple-900/30";
      case "flexibility":
        return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
      case "cycling":
        return "text-green-500 bg-green-100 dark:bg-green-900/30";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800/40";
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
            className="p-4 rounded-xl glass hover:shadow-lg transition-all duration-300 border border-white/20 dark:border-white/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`p-2 rounded-lg ${getWorkoutTypeColor(workout.type)}`}>
                    {getWorkoutIcon(workout.type)}
                  </span>
                  <div>
                    <h4 className="font-semibold text-base">{workout.name}</h4>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                      {workout.type}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                      <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>{formatDate(workout.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-green-100 dark:bg-green-900/30">
                      <Clock className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <span>{workout.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/30">
                      <Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span>{workout.calories} kcal</span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(workout.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 rounded-xl glass"
        >
          <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
            <Activity className="h-8 w-8 text-purple-500 animate-pulse-soft" />
          </div>
          <p className="font-medium text-gray-700 dark:text-gray-300">No workouts recorded yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Track your first workout to see it here
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default WorkoutHistoryList;
