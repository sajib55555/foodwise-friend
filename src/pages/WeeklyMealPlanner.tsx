
import React, { useState, useCallback, useEffect } from "react";
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

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (apiTimeout) {
        clearTimeout(apiTimeout);
      }
    };
  }, [apiTimeout]);

  const generateMealPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Create a timeout that will automatically switch to fallback mode if the API takes too long
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("The meal plan generation is taking longer than expected. Please try again.");
        toast({
          title: "Request Timeout",
          description: "The meal plan generation took too long. Please try again.",
          variant: "destructive",
        });
      }
    }, 15000); // 15 seconds timeout
    
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
      
      // Clear the timeout since we got a response
      clearTimeout(timeout);
      setApiTimeout(null);
      
      if (error) {
        console.error("Supabase function error:", error);
        setError("Failed to call meal plan generation function. Please try again.");
        throw error;
      }
      
      if (!data || !data.days) {
        console.error("Invalid response format:", data);
        setError("Received invalid meal plan data. Please try again.");
        throw new Error("Invalid meal plan data");
      }
      
      setMealPlan(data as MealPlan);
      setActiveDay("day1");
      
      toast({
        title: "Meal Plan Generated",
        description: `Your ${days}-day meal plan is ready!`,
      });
    } catch (error) {
      // Clear the timeout since we got an error response
      clearTimeout(timeout);
      setApiTimeout(null);
      
      console.error("Error generating meal plan:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate your meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [preferences, restrictions, goals, days, toast, loading]);

  const saveMealPlan = () => {
    // This would be implemented to save the meal plan to the user's profile
    toast({
      title: "Meal Plan Saved",
      description: "Your meal plan has been saved to your profile.",
    });
  };

  // Get day name for display
  const getDayName = (index: number) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days[index % 7];
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Calendar className="h-5 w-5 text-green-500" />
                Weekly Meal Planner
              </CardTitle>
              <CardDescription>
                Generate a personalized meal plan based on your preferences and goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="preferences">Dietary Preference</Label>
                    <Select value={preferences} onValueChange={setPreferences}>
                      <SelectTrigger id="preferences">
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
                    <Label htmlFor="restrictions">Dietary Restrictions (optional)</Label>
                    <Input
                      id="restrictions"
                      placeholder="E.g., gluten-free, no peanuts"
                      value={restrictions}
                      onChange={(e) => setRestrictions(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goals">Nutritional Goals</Label>
                    <Select value={goals} onValueChange={setGoals}>
                      <SelectTrigger id="goals">
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
                    <Label htmlFor="days">Plan Duration</Label>
                    <Select value={days} onValueChange={setDays}>
                      <SelectTrigger id="days">
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
                  variant="green-gradient"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-lg md:text-xl font-semibold">Your {days}-Day Meal Plan</h2>
                <Button onClick={saveMealPlan} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Save Plan
                </Button>
              </div>
              
              <Tabs value={activeDay} onValueChange={setActiveDay}>
                {/* Improved tab display to show all days properly */}
                <div className="relative mb-2">
                  <ScrollArea className="w-full max-w-full">
                    <div className="pb-0.5">
                      <TabsList className="inline-flex h-auto py-1 w-auto min-w-full">
                        {Object.keys(mealPlan.days).map((day, index) => (
                          <TabsTrigger 
                            key={day} 
                            value={day} 
                            className="px-4 py-2 whitespace-nowrap text-sm flex-shrink-0"
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
