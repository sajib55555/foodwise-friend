
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Flame, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CalorieIntakeCardProps {
  actualCalories?: number;
  targetCalories?: number;
  mealBreakdown?: {name: string; calories: number}[];
  isLoading?: boolean;
}

const CalorieIntakeCard: React.FC<CalorieIntakeCardProps> = ({ 
  actualCalories,
  targetCalories,
  mealBreakdown,
  isLoading = false
}) => {
  const [userTargetCalories, setUserTargetCalories] = useState(targetCalories || 2000);
  const [userActualCalories, setUserActualCalories] = useState(actualCalories || 0);
  const [userMealBreakdown, setUserMealBreakdown] = useState(mealBreakdown || []);
  const [loading, setLoading] = useState(isLoading);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Update component state when props change
    if (actualCalories !== undefined) setUserActualCalories(actualCalories);
    if (targetCalories !== undefined) setUserTargetCalories(targetCalories);
    if (mealBreakdown !== undefined) setUserMealBreakdown(mealBreakdown);
    setLoading(isLoading);
  }, [actualCalories, targetCalories, mealBreakdown, isLoading]);
  
  useEffect(() => {
    // Fetch user target calories from user_macros if not provided via props
    async function fetchUserMacros() {
      if (!user || targetCalories !== undefined) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_macros')
          .select('calories')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error("Error fetching user macros:", error);
          toast({
            title: "Error fetching nutritional data",
            description: "Please try again later",
            variant: "destructive"
          });
          return;
        }
        
        if (data && data.length > 0) {
          setUserTargetCalories(data[0].calories || 2000);
        } else {
          // Create default user macros if none exist
          const { error: insertError } = await supabase
            .from('user_macros')
            .insert({
              user_id: user.id,
              calories: 2000,
              protein: 80,
              carbs: 200,
              fat: 65,
              calculation_method: 'default'
            });
            
          if (insertError) {
            console.error("Error creating default user macros:", insertError);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user macros:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserMacros();
  }, [user, targetCalories, toast]);
  
  // Calculate percentage
  const percentage = userTargetCalories > 0 
    ? Math.min(Math.round((userActualCalories / userTargetCalories) * 100), 100) 
    : 0;
  
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
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <div className="w-5 h-5 border-2 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-orange-500">{userActualCalories}</span>
                  <span className="ml-1 text-sm text-muted-foreground">/ {userTargetCalories} kcal</span>
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
                {userMealBreakdown && userMealBreakdown.length > 0 ? (
                  userMealBreakdown.map((meal, index) => (
                    <motion.div
                      key={meal.name}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="flex flex-col items-center justify-center p-2 rounded-md bg-orange-50/50 dark:bg-orange-950/20"
                    >
                      <span className="font-medium text-orange-700 dark:text-orange-300">{meal.name}</span>
                      <span className="text-xs text-orange-600 dark:text-orange-400">{meal.calories} cal</span>
                    </motion.div>
                  ))
                ) : (
                  ["Breakfast", "Lunch", "Dinner"].map((meal, index) => (
                    <motion.div
                      key={meal}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="flex flex-col items-center justify-center p-2 rounded-md bg-orange-50/50 dark:bg-orange-950/20"
                    >
                      <span className="font-medium text-orange-700 dark:text-orange-300">{meal}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalorieIntakeCard;
