
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button-custom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ExerciseTracker = () => {
  const navigate = useNavigate();
  
  // Mock data for recent exercises
  const recentExercises = [
    { id: 1, name: "Morning Run", duration: 25, calories: 320, date: "Today, 7:30 AM" },
    { id: 2, name: "Strength Training", duration: 45, calories: 210, date: "Yesterday, 6:15 PM" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card variant="glass">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Exercise Activity
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentExercises.length > 0 ? (
            <ul className="space-y-3">
              {recentExercises.map((exercise) => (
                <li 
                  key={exercise.id} 
                  className="p-3 rounded-lg bg-background/50 border border-purple-100/20 hover:bg-background/70 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">{exercise.name}</h4>
                      <p className="text-xs text-muted-foreground">{exercise.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{exercise.calories} kcal</p>
                      <p className="text-xs text-muted-foreground">{exercise.duration} min</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">No recent exercises</p>
            </div>
          )}
          
          <Button 
            variant="purple" 
            className="w-full mt-4"
            size="sm"
          >
            Track New Workout
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExerciseTracker;
