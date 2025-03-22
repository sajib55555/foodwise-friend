import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTransition from "@/components/layout/PageTransition";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import NutritionCharts from "@/components/nutrition/NutritionCharts";
import NutritionInsights from "@/components/nutrition/NutritionInsights";
import DetailedNutritionAnalysis from "@/components/nutrition/DetailedNutritionAnalysis";
import { Card, CardContent } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Heart, Leaf, Utensils, ArrowUpCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Define interface for the meal data
interface MealData {
  name: string;
  servingSize?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: Array<{ name: string; healthy: boolean; warning?: string }>;
  healthScore?: number;
  warnings?: string[];
  recommendations?: string[];
  vitamins?: { name: string; amount: string }[];
  minerals?: { name: string; amount: string }[];
  dietary?: {
    vegan: boolean;
    vegetarian: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
  time?: string;
}

interface MealLogMetadata {
  meal_type?: string;
  food_items?: string[];
  scanned_food?: any;
}

// Define interface for the nutrition analysis
interface NutritionAnalysisData {
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: { name: string; healthy: boolean; warning?: string }[];
  healthScore: number;
  warnings: string[];
  recommendations: string[];
  vitamins: { name: string; amount: string }[];
  minerals: { name: string; amount: string }[];
  dietary: {
    vegan: boolean;
    vegetarian: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
}

const Nutrition = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [latestMeal, setLatestMeal] = useState<MealData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchLatestMeal() {
      setIsLoading(true);
      try {
        // Query activity logs for meal_logged activities, get the latest one
        const { data, error } = await supabase
          .from('user_activity_logs')
          .select('*')
          .eq('activity_type', 'meal_logged')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error fetching meal data:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          // Process the meal data
          const latestMealLog = data[0];
          const metadata = latestMealLog.metadata as MealLogMetadata || {};
          
          // Check if we have scanned food data with complete nutrition info
          if (metadata.scanned_food && typeof metadata.scanned_food === 'object') {
            // Extract the complete scanned food data if available
            const scannedFood = metadata.scanned_food;
            
            // Check if the scanned food has detailed nutrition data
            if (scannedFood && scannedFood.ingredients) {
              // This is a complete nutrition analysis from the scan
              const processedMeal: MealData = {
                name: scannedFood.name || "Unknown Food",
                servingSize: scannedFood.servingSize || "1 serving",
                calories: Number(scannedFood.calories) || 0,
                protein: Number(scannedFood.protein) || 0,
                carbs: Number(scannedFood.carbs) || 0,
                fat: Number(scannedFood.fat) || 0,
                ingredients: scannedFood.ingredients || [],
                healthScore: scannedFood.healthScore || 5,
                warnings: scannedFood.warnings || [],
                recommendations: scannedFood.recommendations || [],
                vitamins: scannedFood.vitamins || [],
                minerals: scannedFood.minerals || [],
                dietary: scannedFood.dietary || {
                  vegan: false,
                  vegetarian: false,
                  glutenFree: false,
                  dairyFree: false
                },
                time: format(new Date(latestMealLog.created_at), 'h:mm a')
              };
              
              setLatestMeal(processedMeal);
              setIsLoading(false);
              return;
            }
          }
          
          // If we don't have detailed scanned food data, use basic metadata
          const mealType = (metadata.meal_type || 'snack').toLowerCase();
          
          // Get nutritional values
          let calories = 0;
          let protein = 0;
          let carbs = 0;
          let fat = 0;
          let mealName = "";
          let mealIngredients: Array<{ name: string; healthy: boolean; warning?: string }> = [];
          
          if (metadata.scanned_food) {
            const sf = metadata.scanned_food;
            mealName = sf.name || mealType.charAt(0).toUpperCase() + mealType.slice(1);
            calories = Number(sf.calories) || 0;
            protein = Number(sf.protein) || 0;
            carbs = Number(sf.carbs) || 0;
            fat = Number(sf.fat) || 0;
          } else {
            mealName = mealType.charAt(0).toUpperCase() + mealType.slice(1) + " Meal";
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
          
          // Get food items
          if (metadata.food_items && metadata.food_items.length > 0) {
            mealIngredients = metadata.food_items.map(item => ({
              name: item,
              healthy: !item.toLowerCase().includes('sugar') && 
                      !item.toLowerCase().includes('fried') && 
                      !item.toLowerCase().includes('processed'),
              warning: item.toLowerCase().includes('sugar') ? 'High sugar content' : 
                      item.toLowerCase().includes('fried') ? 'Fried foods are high in unhealthy fats' :
                      item.toLowerCase().includes('processed') ? 'Highly processed' : undefined
            }));
          }
          
          // Format the time
          const createdAt = new Date(latestMealLog.created_at);
          const formattedTime = format(createdAt, 'h:mm a');
          
          // Create processed meal data
          const processedMeal: MealData = {
            name: mealName,
            servingSize: "1 serving",
            calories,
            protein,
            carbs,
            fat,
            ingredients: mealIngredients.length > 0 ? mealIngredients : [
              { name: "No detailed ingredients available", healthy: false }
            ],
            healthScore: calculateHealthScore(protein, carbs, fat),
            warnings: generateWarnings(calories, fat),
            recommendations: generateRecommendations(protein, calories),
            time: formattedTime,
            dietary: {
              vegan: false,
              vegetarian: true,
              glutenFree: true,
              dairyFree: mealIngredients.every(item => 
                !item.name.toLowerCase().includes('yogurt') && 
                !item.name.toLowerCase().includes('cheese') && 
                !item.name.toLowerCase().includes('milk'))
            },
            vitamins: generateVitamins(),
            minerals: generateMinerals()
          };
          
          setLatestMeal(processedMeal);
        } else {
          // If no data, use fallback
          setLatestMeal(null);
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
    
    fetchLatestMeal();
  }, [toast]);

  // Helper functions for generating meal analysis
  function calculateHealthScore(protein: number, carbs: number, fat: number): number {
    // Simple algorithm: higher protein ratio, moderate carbs, lower fat = better score
    const total = protein + carbs + fat;
    if (total === 0) return 5.0;
    
    const proteinRatio = protein / total;
    const carbsRatio = carbs / total;
    const fatRatio = fat / total;
    
    // Ideal macros might be around 30% protein, 50% carbs, 20% fat
    // Calculate deviation from ideal and convert to a score
    const score = 8.5 - (
      Math.abs(proteinRatio - 0.3) * 5 +
      Math.abs(carbsRatio - 0.5) * 3 +
      Math.abs(fatRatio - 0.2) * 4
    );
    
    return Math.max(1, Math.min(10, score));
  }
  
  function generateWarnings(calories: number, fat: number): string[] {
    const warnings: string[] = [];
    
    if (calories > 600) {
      warnings.push("High calorie content");
    }
    
    if (fat > 25) {
      warnings.push("Contains high fat content");
    }
    
    if (warnings.length === 0) {
      warnings.push("No significant nutritional concerns");
    }
    
    return warnings;
  }
  
  function generateRecommendations(protein: number, calories: number): string[] {
    const recommendations: string[] = [];
    
    if (protein < 15) {
      recommendations.push("Consider adding a protein source to increase protein content");
    }
    
    if (calories < 200) {
      recommendations.push("This meal may not provide sufficient energy, consider adding more nutritious ingredients");
    }
    
    recommendations.push("Stay hydrated by drinking water with your meal");
    
    if (recommendations.length === 1) {
      recommendations.push("Overall a balanced meal, good job!");
    }
    
    return recommendations;
  }
  
  function generateVitamins(): { name: string; amount: string }[] {
    return [
      { name: "Vitamin C", amount: "45% DV" },
      { name: "Vitamin A", amount: "12% DV" },
      { name: "Vitamin D", amount: "15% DV" },
      { name: "Vitamin B12", amount: "20% DV" }
    ];
  }
  
  function generateMinerals(): { name: string; amount: string }[] {
    return [
      { name: "Potassium", amount: "520mg" },
      { name: "Calcium", amount: "200mg" },
      { name: "Iron", amount: "2mg" },
      { name: "Zinc", amount: "1.2mg" }
    ];
  }

  return (
    <PageTransition>
      <Header title="Nutrition" />
      <main className="flex-1 container mx-auto px-4 pb-24 pt-6 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/5 rounded-full filter blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-400/5 rounded-full filter blur-3xl -z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card variant="glass" className="border border-green-200/30 dark:border-green-800/20">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 text-white">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Nutrition Tracking</h2>
                    <p className="text-sm text-muted-foreground">Monitor your nutritional intake and habits</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="green-gradient" size="sm" className="gap-1.5">
                    <Leaf className="w-4 h-4" />
                    Add Food
                  </Button>
                  <Button variant="glass-green" size="sm" className="gap-1.5">
                    <Heart className="w-4 h-4" />
                    Favorites
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50">
                    <ArrowUpCircle className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <Tabs 
          defaultValue="dashboard" 
          className="space-y-4" 
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 w-full bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/20">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-900/40 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-200">Dashboard</TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-900/40 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-200">Insights</TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-900/40 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-200">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <NutritionCharts />
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-6">
            <NutritionInsights />
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-green-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
            ) : latestMeal ? (
              <DetailedNutritionAnalysis nutritionData={latestMeal as NutritionAnalysisData} />
            ) : (
              <div className="text-center py-12">
                <Info className="h-12 w-12 text-green-500/50 mx-auto mb-2" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No meals logged yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Log a meal to see detailed nutrition analysis
                </p>
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.href = '/scan'}
                >
                  Scan Food Item
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

export default Nutrition;
