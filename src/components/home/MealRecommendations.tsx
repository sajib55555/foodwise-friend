
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
    balanced: "data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 dark:data-[state=active]:bg-amber-900/30 dark:data-[state=active]:text-amber-300",
    protein: "data-[state=active]:bg-red-100 data-[state=active]:text-red-700 dark:data-[state=active]:bg-red-900/30 dark:data-[state=active]:text-red-300",
    lowCarb: "data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300",
    plantBased: "data-[state=active]:bg-green-100 data-[state=active]:text-green-700 dark:data-[state=active]:bg-green-900/30 dark:data-[state=active]:text-green-300",
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
      
      const response = data as MealRecommendationsResponse;
      setRecommendations(response.meals);
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
      fetchRecommendations(preference.label);
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
              <ChefHat className="h-5 w-5 text-amber-500" />
              Meal Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                {dietaryPreferences.map(pref => (
                  <TabsTrigger 
                    key={pref.id} 
                    value={pref.id}
                    disabled={loading}
                    className={cn(
                      "transition-all",
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
                    variant="amber-gradient"
                    className="w-full"
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
                <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
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
                  
                  <div className="flex justify-end gap-2 mt-2">
                    <Button size="sm" variant="amber-gradient" className="gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Save for Later
                    </Button>
                    <Button size="sm" variant="amber-gradient" className="gap-1">
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
