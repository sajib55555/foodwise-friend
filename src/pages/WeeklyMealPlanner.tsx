
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Loader2, Calendar, ChefHat, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button-custom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card-custom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";

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

  const generateMealPlan = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-weekly-meal-plan", {
        body: {
          preferences,
          restrictions,
          nutritionalGoals: goals,
          numberOfDays: parseInt(days, 10)
        }
      });
      
      if (error) throw error;
      
      setMealPlan(data as MealPlan);
      setActiveDay("day1");
      
      toast({
        title: "Meal Plan Generated",
        description: `Your ${days}-day meal plan is ready!`,
      });
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast({
        title: "Error",
        description: "Failed to generate your meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMealPlan = () => {
    // This would be implemented to save the meal plan to the user's profile
    toast({
      title: "Meal Plan Saved",
      description: "Your meal plan has been saved to your profile.",
    });
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
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
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
              
              <div className="mt-6">
                <Button 
                  onClick={generateMealPlan} 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                  variant="purple"
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
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your {days}-Day Meal Plan</h2>
                <Button onClick={saveMealPlan} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Save Plan
                </Button>
              </div>
              
              <Tabs value={activeDay} onValueChange={setActiveDay}>
                <TabsList className="grid grid-cols-7 mb-4 overflow-x-auto flex-nowrap">
                  {Object.keys(mealPlan.days).map((day, index) => (
                    <TabsTrigger key={day} value={day} className="whitespace-nowrap">
                      Day {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(mealPlan.days).map(([day, meals]) => (
                  <TabsContent key={day} value={day} className="space-y-4">
                    {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                      const meal = meals[mealType as keyof DayMeals];
                      if (!meal) return null;
                      
                      return (
                        <Card key={mealType} className="overflow-hidden">
                          <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                </div>
                                <CardTitle className="text-lg">{meal.name}</CardTitle>
                              </div>
                              <div className="text-sm font-medium">{meal.calories} kcal</div>
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
                              <h4 className="text-xs uppercase tracking-wider font-semibold mb-2 text-muted-foreground">Ingredients</h4>
                              <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {meal.ingredients.map((ingredient, i) => (
                                  <li key={i} className="text-sm flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
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

export default WeeklyMealPlanner;
