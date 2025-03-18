import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button-custom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Plus, Search, Camera } from "lucide-react";
import { useActivityLog } from "@/contexts/ActivityLogContext";

const LogMeal = () => {
  const navigate = useNavigate();
  const [mealType, setMealType] = useState("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [foodItems, setFoodItems] = useState<string[]>([]);
  const [customFood, setCustomFood] = useState("");
  const [scannedFoodInfo, setScannedFoodInfo] = useState<any>(null);
  const { logActivity } = useActivityLog();

  const sampleFoods = {
    breakfast: ["Oatmeal", "Eggs", "Toast", "Banana", "Yogurt"],
    lunch: ["Sandwich", "Salad", "Soup", "Wrap", "Rice Bowl"],
    dinner: ["Grilled Chicken", "Pasta", "Salmon", "Stir Fry", "Pizza"],
    snack: ["Apple", "Nuts", "Granola Bar", "Protein Shake", "Popcorn"]
  };

  useEffect(() => {
    const scannedFood = sessionStorage.getItem('scannedFood');
    if (scannedFood) {
      const foodData = JSON.parse(scannedFood);
      setScannedFoodInfo(foodData);
      setFoodItems(prev => [...prev, foodData.name]);
      sessionStorage.removeItem('scannedFood'); // Clear after using
      
      toast({
        title: "Food Added",
        description: `${foodData.name} has been added from your scan.`,
      });
    }
  }, []);

  const handleAddFood = () => {
    if (customFood.trim()) {
      setFoodItems([...foodItems, customFood]);
      setCustomFood("");
      toast({
        title: "Food Added",
        description: `${customFood} has been added to your meal.`,
      });
    }
  };

  const handleSaveMeal = () => {
    if (foodItems.length === 0) return;
    
    logActivity('meal_logged', `Logged a ${mealType} meal`, { 
      meal_type: mealType, 
      food_items: foodItems,
      scanned_food: scannedFoodInfo
    });
    
    toast({
      title: "Meal Logged",
      description: "Your meal has been successfully logged.",
    });
    navigate("/nutrition");
  };

  const handleScanFood = () => {
    navigate("/scan");
  };

  const filteredFoods = sampleFoods[mealType as keyof typeof sampleFoods].filter(
    food => food.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <Header title="Log Meal" showBackButton />
      <main className="container max-w-md mx-auto px-4 pb-24 pt-20">
        <Card className="glass-card mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-500" />
              Meal Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={mealType} 
              onValueChange={setMealType}
            >
              <SelectTrigger className="w-full mb-2 bg-background/50 border-purple-100">
                <SelectValue placeholder="Select a meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Search className="w-5 h-5 mr-2 text-purple-500" />
              Search Foods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="Search for foods..."
                className="flex-1 bg-background/50 border-purple-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                size="icon"
                variant="outline"
                className="bg-background/50 text-purple-500"
                onClick={handleScanFood}
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {filteredFoods.map((food, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-purple-100/30"
                >
                  <span>{food}</span>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-purple-500 hover:text-purple-700 hover:bg-purple-100/50"
                    onClick={() => {
                      setFoodItems([...foodItems, food]);
                      toast({
                        title: "Food Added",
                        description: `${food} has been added to your meal.`,
                      });
                    }}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Add Custom Food</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter custom food..."
                className="flex-1 bg-background/50 border-purple-100"
                value={customFood}
                onChange={(e) => setCustomFood(e.target.value)}
              />
              <Button
                size="icon"
                variant="purple"
                onClick={handleAddFood}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Your Meal</CardTitle>
          </CardHeader>
          <CardContent>
            {foodItems.length > 0 ? (
              <ul className="space-y-2">
                {foodItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 bg-background/30 rounded-lg border border-purple-100/30"
                  >
                    <div className="flex justify-between items-center">
                      <span>{item}</span>
                      {scannedFoodInfo && item === scannedFoodInfo.name && (
                        <div className="text-xs text-purple-600">
                          {scannedFoodInfo.calories} cal • {scannedFoodInfo.protein}g protein
                        </div>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No foods added yet. Add some foods to your meal!
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="purple"
              className="w-full"
              onClick={handleSaveMeal}
              disabled={foodItems.length === 0}
            >
              Save Meal
            </Button>
          </CardFooter>
        </Card>
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

export default LogMeal;
