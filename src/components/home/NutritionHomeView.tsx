
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Utensils } from "lucide-react";
import CalorieIntakeCard from "@/components/nutrition/components/CalorieIntakeCard";
import MacroDistributionCard from "@/components/nutrition/components/MacroDistributionCard";
import GoalProgressCard from "@/components/nutrition/components/GoalProgressCard";
import TodaysFoodConsumption from "@/components/home/TodaysFoodConsumption";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfDay, endOfDay } from "date-fns";

interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

interface MealLogMetadata {
  meal_type?: string;
  food_items?: string[];
  scanned_food?: any;
}

const NutritionHomeView: React.FC = () => {
  const navigate = useNavigate();
  const [mealBreakdown, setMealBreakdown] = useState<{name: string; calories: number}[]>([]);
  const [nutritionTotals, setNutritionTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchMealData() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get today's date range for filtering
        const today = new Date();
        const start = startOfDay(today);
        const end = endOfDay(today);
        
        // Query activity logs for meal_logged activities from today
        const { data, error } = await supabase
          .from('user_activity_logs')
          .select('*')
          .eq('activity_type', 'meal_logged')
          .eq('user_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching meal data:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          // Process the meal data
          const processedMeals: MealData[] = data.map(item => {
            // Properly type the metadata
            const metadata = item.metadata as MealLogMetadata || {};
            const mealType = (metadata.meal_type || 'snack').toLowerCase();
            
            // Get nutritional values
            let calories = 0;
            let protein = 0;
            let carbs = 0;
            let fat = 0;
            let mealName = mealType.charAt(0).toUpperCase() + mealType.slice(1);
            
            // Check for scanned food with detailed nutrition info
            if (metadata.scanned_food) {
              const sf = metadata.scanned_food;
              
              // If scanned_food is a complete object with detailed info
              if (typeof sf === 'object') {
                mealName = sf.name || mealName;
                calories = Number(sf.calories) || 0;
                protein = Number(sf.protein) || 0;
                carbs = Number(sf.carbs) || 0;
                fat = Number(sf.fat) || 0;
              }
            }
            
            return {
              name: mealName,
              calories,
              protein,
              carbs,
              fat,
              time: format(new Date(item.created_at), 'h:mm a')
            };
          });
          
          // Prepare meal breakdown for CalorieIntakeCard
          const breakdown = processedMeals.reduce((acc, meal) => {
            const existingMealType = acc.find(m => m.name.toLowerCase() === meal.name.toLowerCase());
            
            if (existingMealType) {
              existingMealType.calories += meal.calories;
            } else {
              acc.push({
                name: meal.name,
                calories: meal.calories
              });
            }
            
            return acc;
          }, [] as {name: string; calories: number}[]);
          
          setMealBreakdown(breakdown);
          
          // Calculate total nutrition
          const totals = processedMeals.reduce((acc, meal) => {
            return {
              calories: acc.calories + meal.calories,
              protein: acc.protein + meal.protein,
              carbs: acc.carbs + meal.carbs,
              fat: acc.fat + meal.fat
            };
          }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
          
          setNutritionTotals(totals);
        } else {
          setMealBreakdown([]);
          setNutritionTotals({
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          });
        }
      } catch (error) {
        console.error('Error in meal data processing:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMealData();
    
    // Set up a refresh interval (every 5 minutes)
    const intervalId = setInterval(() => {
      if (user) fetchMealData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  // Container animation settings
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
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="glass" className="overflow-hidden border-green-100/40 dark:border-green-900/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center">
                <Utensils className="mr-2 h-4 w-4 text-green-500" />
                Nutrition Summary
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => navigate('/nutrition')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <motion.div 
              className="space-y-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item}>
                <CalorieIntakeCard 
                  actualCalories={nutritionTotals.calories}
                  mealBreakdown={mealBreakdown}
                  isLoading={isLoading}
                />
              </motion.div>
              
              <motion.div variants={item}>
                <MacroDistributionCard 
                  protein={nutritionTotals.protein}
                  carbs={nutritionTotals.carbs}
                  fat={nutritionTotals.fat}
                  isLoading={isLoading}
                />
              </motion.div>
              
              <motion.div variants={item}>
                <GoalProgressCard />
              </motion.div>
              
              <motion.div variants={item}>
                <TodaysFoodConsumption />
              </motion.div>
              
              <div className="flex justify-center mt-2">
                <Button
                  variant="green-gradient"
                  size="sm"
                  className="shadow-sm"
                  onClick={() => navigate('/nutrition')}
                >
                  View Detailed Nutrition
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NutritionHomeView;
