import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay } from "date-fns";
import CalorieIntakeCard from "./components/CalorieIntakeCard";
import MacroDistributionCard from "./components/MacroDistributionCard";
import GoalProgressCard from "./components/GoalProgressCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { useToast } from "@/hooks/use-toast";
import { Utensils, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

const NutritionInsights: React.FC = () => {
  const [meals, setMeals] = useState<MealData[]>([]);
  const [totalNutrition, setTotalNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchMealData() {
      setIsLoading(true);
      try {
        if (!user) {
          setMeals([]);
          setIsLoading(false);
          return;
        }

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
              } else {
                // Legacy format where scanned_food might be simpler
                calories = Number(metadata.scanned_food.calories) || 0;
                protein = Number(metadata.scanned_food.protein) || 0;
                carbs = Number(metadata.scanned_food.carbs) || 0;
                fat = Number(metadata.scanned_food.fat) || 0;
              }
            } else {
              // Estimate nutritional values if not provided
              switch(mealType) {
                case 'breakfast':
                  calories = 350;
                  protein = 15;
                  carbs = 45;
                  fat = 12;
                  break;
                case 'lunch':
                  calories = 520;
                  protein = 25;
                  carbs = 65;
                  fat = 15;
                  break;
                case 'dinner':
                  calories = 650;
                  protein = 35;
                  carbs = 70;
                  fat = 20;
                  break;
                default: // snack
                  calories = 180;
                  protein = 5;
                  carbs = 25;
                  fat = 8;
              }
            }
            
            // Format the time
            const createdAt = new Date(item.created_at);
            const formattedTime = format(createdAt, 'h:mm a');
            
            return {
              name: mealName,
              calories,
              protein,
              carbs,
              fat,
              time: formattedTime
            };
          });
          
          setMeals(processedMeals);
          
          // Calculate total nutrition
          const totals = processedMeals.reduce((acc, meal) => {
            return {
              calories: acc.calories + meal.calories,
              protein: acc.protein + meal.protein,
              carbs: acc.carbs + meal.carbs,
              fat: acc.fat + meal.fat
            };
          }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
          
          setTotalNutrition(totals);
        } else {
          setMeals([]);
          setTotalNutrition({
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          });
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

  return (
    <div className="space-y-6">
      <CalorieIntakeCard actualCalories={totalNutrition.calories} />
      <MacroDistributionCard 
        protein={totalNutrition.protein}
        carbs={totalNutrition.carbs}
        fat={totalNutrition.fat}
      />
      <GoalProgressCard />
      
      {/* Component to show consumed food details */}
      <Card variant="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Utensils className="h-4 w-4 mr-2 text-green-500" />
            Today's Food Consumption
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-green-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
          ) : meals.length > 0 ? (
            <div className="space-y-4">
              {meals.map((meal, index) => (
                <div key={index} className="p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium text-green-700 dark:text-green-300">{meal.name} - {meal.time}</h4>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">{meal.calories} cal</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-green-600 dark:text-green-400">
                    <div>Protein: {meal.protein}g</div>
                    <div>Carbs: {meal.carbs}g</div>
                    <div>Fat: {meal.fat}g</div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-green-100/50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800/50">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-green-800 dark:text-green-200">Daily Total</h4>
                  <span className="font-semibold text-green-800 dark:text-green-200">{totalNutrition.calories} cal</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-green-700 dark:text-green-300">
                  <div>Protein: {totalNutrition.protein}g</div>
                  <div>Carbs: {totalNutrition.carbs}g</div>
                  <div>Fat: {totalNutrition.fat}g</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No meals logged today</p>
              <p className="text-sm mt-1">Log your meals to see nutrition analysis</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionInsights;
