
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { ArrowRight, ChefHat, Clock, ScrollText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Meal {
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

interface MealRecommendationsResponse {
  meals: Meal[];
}

const MealRecommendations: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Meal[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPreferences, setCurrentPreferences] = useState("Balanced");
  const [activeTab, setActiveTab] = useState("balanced");
  
  const dietaryPreferences = [
    { id: "balanced", label: "Balanced", description: "Well-rounded meals with a good mix of macronutrients" },
    { id: "protein", label: "High Protein", description: "Meals focused on protein-rich ingredients for muscle growth and repair" },
    { id: "lowCarb", label: "Low Carb", description: "Meals with reduced carbohydrates and more healthy fats" },
    { id: "plantBased", label: "Plant-Based", description: "Nutritious meals made exclusively from plant sources" }
  ];

  // Map of dietary preferences to color classes
  const tabColors = {
    balanced: "data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300",
    protein: "data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300",
    lowCarb: "data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300",
    plantBased: "data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300",
  };

  const fetchRecommendations = async (preference: string) => {
    setLoading(true);
    setCurrentPreferences(preference);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-meal-recommendations", {
        body: {
          preferences: preference,
          restrictions: "", // This could be populated from user profile
          nutritionalGoals: "" // This could be populated from user profile
        }
      });
      
      if (error) throw error;
      
      // Make sure we have valid data before setting it
      const response = data as MealRecommendationsResponse;
      
      if (!response || !response.meals || !Array.isArray(response.meals)) {
        throw new Error("Invalid response format from meal recommendations");
      }
      
      // Validate meal data to ensure it has the required properties
      const validatedMeals = response.meals.map(meal => ({
        name: meal.name || "Unnamed Meal",
        description: meal.description || "No description available",
        ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
        calories: typeof meal.calories === 'number' ? meal.calories : 0,
        macros: {
          protein: meal.macros?.protein || "0g",
          carbs: meal.macros?.carbs || "0g",
          fat: meal.macros?.fat || "0g"
        }
      }));
      
      setRecommendations(validatedMeals);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching meal recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to get meal recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Find the corresponding preference label
    const preference = dietaryPreferences.find(pref => pref.id === value);
    if (preference) {
      setCurrentPreferences(preference.label);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-purple-500" />
              Meal Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4 gap-2">
                {dietaryPreferences.map(pref => (
                  <TabsTrigger 
                    key={pref.id} 
                    value={pref.id}
                    disabled={loading}
                    className={cn(
                      "transition-all text-sm whitespace-nowrap px-2 py-1.5",
                      tabColors[pref.id as keyof typeof tabColors]
                    )}
                  >
                    {pref.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {dietaryPreferences.map(pref => (
                <TabsContent key={pref.id} value={pref.id} className="space-y-4">
                  <p className="text-sm text-muted-foreground">{pref.description}</p>
                  
                  <Button 
                    variant="purple-gradient"
                    className="w-full"
                    size={isMobile ? "sm" : "default"}
                    onClick={() => fetchRecommendations(pref.label)}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Get Recommendations"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
        
        <DialogContent className="max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentPreferences} Meal Recommendations</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {recommendations.map((meal, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
                    <div className="text-sm font-medium">{meal.calories} kcal</div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">{meal.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="py-1 px-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs">
                      Protein: {meal.macros.protein}
                    </div>
                    <div className="py-1 px-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs">
                      Carbs: {meal.macros.carbs}
                    </div>
                    <div className="py-1 px-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs">
                      Fat: {meal.macros.fat}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <h4 className="text-xs uppercase tracking-wider font-semibold mb-2 text-muted-foreground">Ingredients</h4>
                    <ul className="grid grid-cols-1 gap-y-1">
                      {meal.ingredients.map((ingredient, i) => (
                        <li key={i} className="text-sm flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-1"></span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-2 mt-4">
                    <Button size="sm" variant="purple-gradient" className="gap-1 w-full sm:w-auto">
                      <Clock className="h-3.5 w-3.5" />
                      Save for Later
                    </Button>
                    <Button size="sm" variant="purple-gradient" className="gap-1 w-full sm:w-auto">
                      <ScrollText className="h-3.5 w-3.5" />
                      Log Meal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default MealRecommendations;
