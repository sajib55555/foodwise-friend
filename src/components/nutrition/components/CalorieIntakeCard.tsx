
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Flame, Target } from "lucide-react";

interface CalorieIntakeCardProps {
  actualCalories?: number;
}

const CalorieIntakeCard: React.FC<CalorieIntakeCardProps> = ({ actualCalories = 0 }) => {
  // Default target calories
  const targetCalories = 2000;
  
  // Calculate percentage
  const percentage = Math.min(Math.round((actualCalories / targetCalories) * 100), 100);
  
  return (
    <Card variant="glass" className="overflow-hidden border-green-100 dark:border-green-900/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Flame className="mr-2 h-4 w-4 text-orange-500" />
          Calorie Intake
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-orange-500">{actualCalories}</span>
              <span className="ml-1 text-sm text-muted-foreground">/ {targetCalories} kcal</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              <span>{percentage}%</span>
            </div>
          </div>
          
          <Progress
            value={percentage}
            className="h-2 bg-orange-100 dark:bg-orange-950/30"
            indicatorClassName="bg-gradient-to-r from-orange-500 to-amber-500"
          />
          
          <div className="grid grid-cols-3 gap-1 pt-2 text-xs text-muted-foreground">
            {["Breakfast", "Lunch", "Dinner"].map((meal, index) => (
              <motion.div
                key={meal}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="flex flex-col items-center justify-center p-2 rounded-md bg-orange-50/50 dark:bg-orange-950/20"
              >
                <span className="font-medium text-orange-700 dark:text-orange-300">{meal}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalorieIntakeCard;
