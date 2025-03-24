
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Award } from "lucide-react";

interface GoalProgressCardProps {
  data?: any[]; // Added to support the data prop
}

const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ data = [] }) => {
  // Process nutrition goals from data
  const calculateProgress = () => {
    if (!data || data.length === 0) return { protein: 0, carbs: 0, calories: 0 };
    
    // Calculate average values from the week
    const totalProtein = data.reduce((sum, day) => sum + (day.protein || 0), 0);
    const totalCarbs = data.reduce((sum, day) => sum + (day.carbs || 0), 0);
    const totalCalories = data.reduce((sum, day) => sum + (day.calories || 0), 0);
    
    const avgProtein = Math.round(totalProtein / data.length);
    const avgCarbs = Math.round(totalCarbs / data.length);
    const avgCalories = Math.round(totalCalories / data.length);
    
    // Calculate percentages (default goals if not in data)
    const proteinGoal = data[0]?.proteinGoal || 100;
    const carbsGoal = data[0]?.carbsGoal || 250;
    const calorieGoal = data[0]?.goal || 2000;
    
    return {
      protein: Math.min(Math.round((avgProtein / proteinGoal) * 100), 100),
      carbs: Math.min(Math.round((avgCarbs / carbsGoal) * 100), 100),
      calories: Math.min(Math.round((avgCalories / calorieGoal) * 100), 100)
    };
  };
  
  const progress = calculateProgress();
  
  return (
    <Card variant="glass" className="overflow-hidden border-purple-100 dark:border-purple-900/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Target className="mr-2 h-4 w-4 text-purple-500" />
          Goal Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-1 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium">Calories</span>
              </div>
              <span className="text-xs text-muted-foreground">{progress.calories}%</span>
            </div>
            <Progress 
              value={progress.calories} 
              className="h-2 bg-purple-100 dark:bg-purple-950/30"
              indicatorClassName="bg-gradient-to-r from-purple-500 to-fuchsia-500"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium">Protein</span>
              </div>
              <span className="text-xs text-muted-foreground">{progress.protein}%</span>
            </div>
            <Progress 
              value={progress.protein} 
              className="h-2 bg-blue-100 dark:bg-blue-950/30"
              indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium">Carbs</span>
              </div>
              <span className="text-xs text-muted-foreground">{progress.carbs}%</span>
            </div>
            <Progress 
              value={progress.carbs} 
              className="h-2 bg-green-100 dark:bg-green-950/30"
              indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </div>
          
          <div className="flex items-center justify-center pt-2">
            {progress.protein >= 90 && progress.carbs >= 90 && progress.calories >= 90 ? (
              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                <Award className="h-4 w-4 mr-1" />
                <span>All nutrition goals on track!</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Keep working toward your goals</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalProgressCard;
