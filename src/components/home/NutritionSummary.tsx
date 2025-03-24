
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface MealData {
  name: string;
  calories: number;
  time: string;
  image: string;
  color: string;
}

interface NutrientData {
  name: string;
  value: number;
  target: number;
  color: string;
  bgColor: string;
  textColor: string;
}

// Define the expected structure of the metadata
interface MealLogMetadata {
  meal_type?: string;
  food_items?: string[];
  scanned_food?: {
    name: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

const NutritionSummary: React.FC = () => {
  const [mealHistory, setMealHistory] = useState<MealData[]>([]);
  const [nutrients, setNutrients] = useState<NutrientData[]>([
    { name: "Calories", value: 0, target: 2000, color: "bg-amber-500", bgColor: "bg-amber-100/50 dark:bg-amber-950/30", textColor: "text-amber-700 dark:text-amber-300" },
    { name: "Protein", value: 0, target: 80, color: "bg-blue-500", bgColor: "bg-blue-100/50 dark:bg-blue-950/30", textColor: "text-blue-700 dark:text-blue-300" },
    { name: "Carbs", value: 0, target: 200, color: "bg-green-500", bgColor: "bg-green-100/50 dark:bg-green-950/30", textColor: "text-green-700 dark:text-green-300" },
    { name: "Fat", value: 0, target: 65, color: "bg-orange-500", bgColor: "bg-orange-100/50 dark:bg-orange-950/30", textColor: "text-orange-700 dark:text-orange-300" }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Default meal image backgrounds
  const mealColors = {
    "breakfast": "from-amber-500/20 to-amber-400/10",
    "lunch": "from-blue-500/20 to-blue-400/10",
    "dinner": "from-purple-500/20 to-purple-400/10",
    "snack": "from-green-500/20 to-green-400/10"
  };

  // Default meal images
  const mealImages = {
    "breakfast": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=100&auto=format&fit=crop",
    "lunch": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100&auto=format&fit=crop",
    "dinner": "https://images.unsplash.com/photo-1576402187878-974f70c890a5?q=80&w=100&auto=format&fit=crop", 
    "snack": "https://images.unsplash.com/photo-1604423043492-41cf507c7e61?q=80&w=100&auto=format&fit=crop"
  };

  useEffect(() => {
    async function fetchMealData() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get today's date at midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Query activity logs for meal_logged activities from today
        const { data, error } = await supabase
          .from('user_activity_logs')
          .select('*')
          .eq('activity_type', 'meal_logged')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching meal data:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          // Process the meal data for display
          const processedMeals: MealData[] = data.map(item => {
            // Properly type the metadata
            const metadata = item.metadata as MealLogMetadata || {};
            const mealType = (metadata.meal_type || 'snack').toLowerCase();
            
            // Calculate total calories from food items if available
            let totalCalories = 0;
            if (metadata.scanned_food && metadata.scanned_food.calories) {
              totalCalories += parseInt(metadata.scanned_food.calories.toString());
            } else {
              // Default calories if not provided
              totalCalories = 0;
            }
            
            // Format the time
            const createdAt = new Date(item.created_at);
            const formattedTime = format(createdAt, 'h:mm a');
            
            return {
              name: mealType.charAt(0).toUpperCase() + mealType.slice(1),
              calories: totalCalories,
              time: formattedTime,
              image: mealImages[mealType as keyof typeof mealImages] || mealImages.snack,
              color: mealColors[mealType as keyof typeof mealColors] || mealColors.snack
            };
          });
          
          setMealHistory(processedMeals);
          
          // Calculate total nutrients from all meals
          let totalCalories = 0;
          let totalProtein = 0;
          let totalCarbs = 0;
          let totalFat = 0;
          
          data.forEach(item => {
            const metadata = item.metadata as MealLogMetadata || {};
            if (metadata.scanned_food) {
              totalCalories += metadata.scanned_food.calories || 0;
              totalProtein += metadata.scanned_food.protein || 0;
              totalCarbs += metadata.scanned_food.carbs || 0;
              totalFat += metadata.scanned_food.fat || 0;
            }
          });
          
          // Update nutrients state with real values
          setNutrients([
            { name: "Calories", value: totalCalories, target: 2000, color: "bg-amber-500", bgColor: "bg-amber-100/50 dark:bg-amber-950/30", textColor: "text-amber-700 dark:text-amber-300" },
            { name: "Protein", value: totalProtein, target: 80, color: "bg-blue-500", bgColor: "bg-blue-100/50 dark:bg-blue-950/30", textColor: "text-blue-700 dark:text-blue-300" },
            { name: "Carbs", value: totalCarbs, target: 200, color: "bg-green-500", bgColor: "bg-green-100/50 dark:bg-green-950/30", textColor: "text-green-700 dark:text-green-300" },
            { name: "Fat", value: totalFat, target: 65, color: "bg-orange-500", bgColor: "bg-orange-100/50 dark:bg-orange-950/30", textColor: "text-orange-700 dark:text-orange-300" }
          ]);
          
        } else {
          // No meal data found
          setMealHistory([
            {
              name: "No meals logged today", 
              calories: 0, 
              time: "Tap + to log a meal",
              image: mealImages.snack,
              color: "from-gray-400/20 to-gray-300/10"
            }
          ]);
          
          // Reset nutrients to zero values
          setNutrients(nutrients.map(nutrient => ({
            ...nutrient,
            value: 0
          })));
        }
      } catch (error) {
        console.error('Error in meal data processing:', error);
        toast({
          title: "Failed to load meal data",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMealData();
  }, [toast, user]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4"
      >
        {nutrients.map((nutrient, i) => (
          <motion.div key={nutrient.name} variants={item}>
            <Card variant="glass-sm" className={cn("overflow-hidden border border-white/20", nutrient.bgColor)}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={cn("text-sm font-medium", nutrient.textColor)}>{nutrient.name}</span>
                    <span className={cn("text-sm", nutrient.textColor)}>
                      {nutrient.value}/{nutrient.target}
                      {nutrient.name === "Calories" ? " kcal" : "g"}
                    </span>
                  </div>
                  <Progress
                    value={(nutrient.value / nutrient.target) * 100}
                    className={cn("h-2", "bg-white/30")}
                    indicatorClassName={nutrient.color}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="glass" className="border border-purple-300/30 dark:border-purple-800/20 bg-gradient-to-br from-purple-50/80 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/10">
          <CardHeader className="pb-2 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500 rounded-full opacity-20"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500 rounded-full opacity-20"></div>
            </div>
            <CardTitle className="text-base bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-bold relative z-10">Today's Meals</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
            ) : (
              <ul className="space-y-3">
                {mealHistory.map((meal, index) => (
                  <motion.li
                    key={`${meal.name}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={cn(
                      "flex items-center space-x-3 p-2 rounded-lg transition-colors",
                      "bg-gradient-to-r", meal.color,
                      "hover:shadow-md border border-white/30 backdrop-blur-sm"
                    )}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md border border-white/40">
                      <img 
                        src={meal.image} 
                        alt={meal.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{meal.name}</p>
                      <p className="text-xs text-muted-foreground">{meal.time}</p>
                    </div>
                    <div className="text-sm font-medium px-2 py-1 rounded-full bg-white/60 backdrop-blur-sm shadow-sm">
                      {meal.calories > 0 ? `${meal.calories} kcal` : ''}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NutritionSummary;
