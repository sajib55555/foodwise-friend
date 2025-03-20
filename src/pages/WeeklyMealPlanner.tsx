import React, { useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Loader2, Calendar, ChefHat, Filter, Download, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button-custom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card-custom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { useIsMobile } from "@/hooks/use-mobile";

interface MealItem {
  name: string;
  description: string;
  ingredients: string[];
  calories: number;
  macros: {
    protein: string;
    carbs: string;
    fat: string;
  };
}

interface DayMeals {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack?: MealItem;
}

interface MealPlan {
  days: {
    [key: string]: DayMeals;
  };
}

interface CachedMealPlan {
  preferences: string;
  restrictions: string;
  goals: string;
  days: string;
  mealPlan: MealPlan;
  timestamp: number;
}

const CACHE_EXPIRY_TIME = 1000 * 60 * 60; // 1 hour cache validity

const WeeklyMealPlanner: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState("Balanced");
  const [restrictions, setRestrictions] = useState("");
  const [goals, setGoals] = useState("Weight maintenance");
  const [days, setDays] = useState("7");
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [activeDay, setActiveDay] = useState("day1");
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [apiTimeout, setApiTimeout] = useState<NodeJS.Timeout | null>(null);
  const mealPlanCache = useRef<CachedMealPlan[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mealPlanSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (apiTimeout) {
        clearTimeout(apiTimeout);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [apiTimeout]);

  const getCachedPlan = (): MealPlan | null => {
    const cacheKey = `${preferences}-${restrictions}-${goals}-${days}`;
    const cachedItem = mealPlanCache.current.find(
      item => 
        item.preferences === preferences && 
        item.restrictions === restrictions && 
        item.goals === goals && 
        item.days === days &&
        (Date.now() - item.timestamp) < CACHE_EXPIRY_TIME
    );
    
    if (cachedItem) {
      console.log("Using cached meal plan");
      return cachedItem.mealPlan;
    }
    
    return null;
  };

  const cacheMealPlan = (newMealPlan: MealPlan) => {
    mealPlanCache.current.push({
      preferences,
      restrictions,
      goals,
      days,
      mealPlan: newMealPlan,
      timestamp: Date.now()
    });
    
    if (mealPlanCache.current.length > 10) {
      mealPlanCache.current.shift();
    }
  };

  const generateMealPlan = useCallback(async () => {
    setError(null);
    
    const cachedPlan = getCachedPlan();
    if (cachedPlan) {
      setMealPlan(cachedPlan);
      setActiveDay("day1");
      toast({
        title: "Meal Plan Ready",
        description: `Your ${days}-day meal plan is ready!`,
      });
      
      setTimeout(() => {
        mealPlanSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
      
      return;
    }
    
    setLoading(true);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    const timeout = setTimeout(() => {
      if (loading) {
        toast({
          title: "Still Working",
          description: "We're still generating your meal plan. Please wait a moment longer.",
        });
      }
    }, 5000);
    
    const maxTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        toast({
          title: "Using Fallback Plan",
          description: "The custom plan is taking too long, so we're using a pre-generated plan for now.",
        });
        fetchFallbackMealPlan();
      }
    }, 8000);
    
    setApiTimeout(timeout);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-weekly-meal-plan", {
        body: {
          preferences,
          restrictions,
          nutritionalGoals: goals,
          numberOfDays: parseInt(days, 10)
        }
      });
      
      clearTimeout(timeout);
      clearTimeout(maxTimeout);
      setApiTimeout(null);
      
      if (error) {
        console.error("Supabase function error:", error);
        setError("Failed to call meal plan generation function. Please try again.");
        fetchFallbackMealPlan();
        return;
      }
      
      if (!data || !data.days) {
        console.error("Invalid response format:", data);
        setError("Received invalid meal plan data. Please try again.");
        fetchFallbackMealPlan();
        return;
      }
      
      const newMealPlan = data as MealPlan;
      setMealPlan(newMealPlan);
      setActiveDay("day1");
      
      cacheMealPlan(newMealPlan);
      
      toast({
        title: "Meal Plan Generated",
        description: `Your ${days}-day meal plan is ready!`,
      });
      
      setTimeout(() => {
        mealPlanSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
      
    } catch (error) {
      clearTimeout(timeout);
      clearTimeout(maxTimeout);
      setApiTimeout(null);
      
      console.error("Error generating meal plan:", error);
      fetchFallbackMealPlan();
    } finally {
      setLoading(false);
    }
  }, [preferences, restrictions, goals, days, toast, loading]);

  const fetchFallbackMealPlan = async () => {
    try {
      const fallbackPlan = generateLocalFallbackPlan(
        parseInt(days, 10), 
        preferences, 
        goals
      );
      
      setMealPlan(fallbackPlan);
      setActiveDay("day1");
      
      setTimeout(() => {
        mealPlanSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (error) {
      console.error("Error generating fallback meal plan:", error);
      setError("Failed to generate any meal plan. Please try again later.");
    }
  };

  const saveMealPlan = () => {
    toast({
      title: "Meal Plan Saved",
      description: "Your meal plan has been saved to your profile.",
    });
  };

  const getDayName = (index: number) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days[index % 7];
  };

  const generateLocalFallbackPlan = (daysCount = 7, userPreferences = 'Balanced', userGoals = 'Weight maintenance'): MealPlan => {
    const fallbackPlan: MealPlan = {
      days: {}
    };
    
    let proteinEmphasis = 1.0;
    if (userPreferences === 'High Protein') proteinEmphasis = 1.5;
    if (userPreferences === 'Low Carb') proteinEmphasis = 1.3;
    
    let calorieMultiplier = 1.0;
    if (userGoals === 'Weight loss') calorieMultiplier = 0.8;
    if (userGoals === 'Muscle gain') calorieMultiplier = 1.2;
    
    const breakfastOptions = [
      {
        name: "Protein Oatmeal Bowl",
        description: "Hearty oatmeal with added protein powder and fruits",
        ingredients: ["Rolled oats", "Protein powder", "Banana", "Berries", "Almond milk", "Honey"],
        calories: Math.round(350 * calorieMultiplier),
        macros: { 
          protein: `${Math.round(18 * proteinEmphasis)}g`, 
          carbs: "45g", 
          fat: "8g" 
        }
      },
      {
        name: "Greek Yogurt Parfait",
        description: "Creamy yogurt layered with fruits and granola",
        ingredients: ["Greek yogurt", "Mixed berries", "Granola", "Honey", "Chia seeds"],
        calories: Math.round(320 * calorieMultiplier),
        macros: { 
          protein: `${Math.round(20 * proteinEmphasis)}g`, 
          carbs: "40g", 
          fat: "10g" 
        }
      },
      {
        name: "Veggie Egg Scramble",
        description: "Fluffy eggs with fresh vegetables and herbs",
        ingredients: ["Eggs", "Spinach", "Bell peppers", "Onions", "Feta cheese", "Whole grain toast"],
        calories: Math.round(380 * calorieMultiplier),
        macros: { 
          protein: `${Math.round(22 * proteinEmphasis)}g`, 
          carbs: "30g", 
          fat: "20g" 
        }
      }
    ];
    
    const lunchOptions = [
      {
        name: "Mediterranean Salad Bowl",
        description: "Fresh salad with quinoa, chickpeas and feta",
        ingredients: ["Mixed greens", "Quinoa", "Chickpeas", "Cucumber", "Cherry tomatoes", "Feta cheese", "Olive oil dressing"],
        calories: Math.round(420 * calorieMultiplier),
        macros: { 
          protein: `${Math.round(15 * proteinEmphasis)}g`, 
          carbs: "50g", 
          fat: "18g" 
        }
      },
      {
        name: "Grilled Chicken Wrap",
        description: "Lean protein with vegetables in a whole grain wrap",
        ingredients: ["Grilled chicken breast", "Whole grain wrap", "Avocado", "Lettuce", "Tomato", "Greek yogurt sauce"],
        calories: Math.round(450 * calorieMultiplier),
        macros: { 
          protein: `${Math.round(30 * proteinEmphasis)}g`, 
          carbs: "40g", 
          fat: "15g" 
        }
      },
      {
        name: "Lentil Soup with Side Salad",
        description: "Hearty lentil soup with a fresh side salad",
        ingredients: ["Red lentils", "Carrots", "Celery", "Onions", "Vegetable broth", "Mixed greens", "Balsamic vinaigrette"],
        calories: Math.round(380 * calorieMultiplier),
        macros: { 
          protein: `${Math.round(18 * proteinEmphasis)}g`, 
          carbs: "55g", 
          fat: "10g" 
        }
      }
    ];
    
    const dinnerOptions = [
      {
        name: "Baked Salmon with Vegetables",
        description: "Omega-rich salmon with roasted seasonal vegetables",
        ingredients: ["Salmon fillet", "Asparagus", "Sweet potatoes", "Olive oil", "Lemon", "Herbs"],
        calories: Math.round(460 * calorieMultiplier),
        macros: { 
          protein: `${Math.round(35 * proteinEmphasis)}g`, 
          carbs: "30g", 
          fat: "22g" 
        }
      },
      {
        name: "Turkey Chili",
        description: "Lean turkey with beans and vegetables in a spicy stew",
        ingredients: ["Ground turkey", "Kidney beans", "Black beans", "Tomatoes", "Bell peppers", "Onions", "Spices"],
        calories: Math.round(420 * calorieMultiplier),
        macros: { 
          protein: `${Math.round(32 * proteinEmphasis)}g`, 
          carbs: "40g", 
          fat: "12g" 
        }
      },
      {
        name: "Stir-Fried Tofu with Brown Rice",
        description: "Plant-based protein with vegetables and whole grains",
        ingredients: ["Tofu", "Brown rice", "Broccoli", "Carrots", "Snow peas", "Soy sauce", "Ginger"],
        calories: Math.round(400 * calorieMultiplier),
        macros: { 
          protein: `${Math.round(20 * proteinEmphasis)}g`, 
          carbs: "50g", 
          fat: "12g" 
        }
      }
    ];
    
    const snackOptions = [
      {
        name: "Apple with Almond Butter",
        description: "Fresh fruit with protein-rich nut butter",
        ingredients: ["Apple", "Almond butter"],
        calories: Math.round(180 * calorieMultiplier),
        macros: { 
          protein: `${Math.round(5 * proteinEmphasis)}g`, 
          carbs: "20g", 
          fat: "9g" 
        }
      },
      {
        name: "Protein Smoothie",
        description: "Refreshing fruit smoothie with added protein",
        ingredients: ["Banana", "Berries", "Protein powder", "Almond milk", "Ice"],
        calories: Math.round(200 * calorieMultiplier),
        macros: { 
          protein: `${Math.round(20 * proteinEmphasis)}g`, 
          carbs: "25g", 
          fat: "3g" 
        }
      },
      {
        name: "Trail Mix",
        description: "Energizing mix of nuts, seeds and dried fruits",
        ingredients: ["Almonds", "Walnuts", "Pumpkin seeds", "Dried cranberries", "Dark chocolate chips"],
        calories: Math.round(190 * calorieMultiplier),
        macros: { 
          protein: `${Math.round(6 * proteinEmphasis)}g`, 
          carbs: "15g", 
          fat: "12g" 
        }
      }
    ];
    
    for (let i = 1; i <= daysCount; i++) {
      fallbackPlan.days[`day${i}`] = {
        breakfast: breakfastOptions[i % breakfastOptions.length],
        lunch: lunchOptions[i % lunchOptions.length],
        dinner: dinnerOptions[i % dinnerOptions.length],
        snack: snackOptions[i % snackOptions.length]
      };
    }
    
    return fallbackPlan;
  };

  return (
    <PageTransition>
      <Header title="Weekly Meal Planner" />
      <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card className="border border-purple-200/30 shadow-purple-lg/10">
            <CardHeader className="bg-gradient-to-r from-purple-50/30 to-purple-100/30">
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-purple-800">
                <Calendar className="h-5 w-5 text-purple-500" />
                Weekly Meal Planner
              </CardTitle>
              <CardDescription className="text-purple-600">
                Generate a personalized meal plan based on your preferences and goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="preferences" className="text-purple-700">Dietary Preference</Label>
                    <Select value={preferences} onValueChange={setPreferences}>
                      <SelectTrigger id="preferences" className="border-purple-200">
                        <SelectValue placeholder="Select dietary preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {dietaryPreferences.map((pref) => (
                          <SelectItem key={pref.value} value={pref.value}>
                            {pref.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="restrictions" className="text-purple-700">Dietary Restrictions (optional)</Label>
                    <Input
                      id="restrictions"
                      placeholder="E.g., gluten-free, no peanuts"
                      value={restrictions}
                      onChange={(e) => setRestrictions(e.target.value)}
                      className="border-purple-200"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goals" className="text-purple-700">Nutritional Goals</Label>
                    <Select value={goals} onValueChange={setGoals}>
                      <SelectTrigger id="goals" className="border-purple-200">
                        <SelectValue placeholder="Select nutritional goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {nutritionalGoals.map((goal) => (
                          <SelectItem key={goal.value} value={goal.value}>
                            {goal.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="days" className="text-purple-700">Plan Duration</Label>
                    <Select value={days} onValueChange={setDays}>
                      <SelectTrigger id="days" className="border-purple-200">
                        <SelectValue placeholder="Select number of days" />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}
              
              <div className="mt-6">
                <Button 
                  onClick={generateMealPlan} 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                  variant="purple-gradient"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Meal Plan...
                    </>
                  ) : (
                    <>
                      <ChefHat className="mr-2 h-4 w-4" />
                      Generate Meal Plan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {mealPlan && (
            <motion.div
              ref={mealPlanSectionRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-lg md:text-xl font-semibold text-purple-800">Your {days}-Day Meal Plan</h2>
                <Button onClick={saveMealPlan} variant="purple-outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Save Plan
                </Button>
              </div>
              
              <Tabs value={activeDay} onValueChange={setActiveDay}>
                <div className="relative mb-3">
                  <ScrollArea className="w-full max-w-full overflow-x-auto" orientation="horizontal">
                    <div className="min-w-max pb-1"> 
                      <TabsList className="flex min-w-max h-auto py-1 px-1 bg-gradient-to-r from-purple-100/50 to-purple-200/50">
                        {Object.keys(mealPlan.days).map((day, index) => (
                          <TabsTrigger 
                            key={day} 
                            value={day} 
                            className="px-5 py-2 mx-0.5 whitespace-nowrap text-sm flex-shrink-0 text-purple-700 data-[state=active]:bg-gradient-premium data-[state=active]:text-white"
                          >
                            <span className="flex flex-col items-center gap-1">
                              <span className="font-medium">{getDayName(index)}</span>
                              <span className="text-xs text-muted-foreground">Day {index + 1}</span>
                            </span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  </ScrollArea>
                </div>
                
                {Object.entries(mealPlan.days).map(([day, meals], dayIndex) => (
                  <TabsContent key={day} value={day} className="space-y-4">
                    <h3 className="text-lg font-medium mb-2">{getDayName(dayIndex)} - Day {dayIndex + 1}</h3>
                    {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                      const meal = meals[mealType as keyof DayMeals];
                      if (!meal) return null;
                      
                      return (
                        <Card key={mealType} className="overflow-hidden">
                          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-900/10">
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <div>
                                <div className="text-xs uppercase tracking-wide text-green-600 dark:text-green-400 mb-1">
                                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                </div>
                                <CardTitle className="text-lg">{meal.name}</CardTitle>
                              </div>
                              <div className="text-sm font-medium bg-white/70 dark:bg-black/20 px-2 py-1 rounded-full text-green-700 dark:text-green-300">
                                {meal.calories} kcal
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 space-y-3">
                            <p className="text-sm text-muted-foreground">{meal.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              <div className="py-1 px-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs">
                                Protein: {meal.macros.protein}
                              </div>
                              <div className="py-1 px-2 rounded-full bg-green-100 dark:bg-green-900/30 text-xs">
                                Carbs: {meal.macros.carbs}
                              </div>
                              <div className="py-1 px-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-xs">
                                Fat: {meal.macros.fat}
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <h4 className="text-xs uppercase tracking-wider font-semibold mb-2 text-green-600 dark:text-green-400">Ingredients</h4>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                {meal.ingredients.map((ingredient, i) => (
                                  <li key={i} className="text-sm flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                    {ingredient}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          )}
        </motion.div>
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

const dietaryPreferences = [
  { value: "Balanced", label: "Balanced" },
  { value: "High Protein", label: "High Protein" },
  { value: "Low Carb", label: "Low Carb" },
  { value: "Plant-Based", label: "Plant-Based" },
  { value: "Mediterranean", label: "Mediterranean" },
  { value: "Keto", label: "Keto" },
  { value: "Paleo", label: "Paleo" }
];

const nutritionalGoals = [
  { value: "Weight maintenance", label: "Weight Maintenance" },
  { value: "Weight loss", label: "Weight Loss" },
  { value: "Muscle gain", label: "Muscle Gain" },
  { value: "Athletic performance", label: "Athletic Performance" },
  { value: "General health", label: "General Health" }
];

const daysOptions = [
  { value: "3", label: "3 Days" },
  { value: "5", label: "5 Days" },
  { value: "7", label: "7 Days (1 Week)" },
  { value: "14", label: "14 Days (2 Weeks)" }
];

export default WeeklyMealPlanner;
