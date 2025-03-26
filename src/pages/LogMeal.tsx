import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Utensils, Camera, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";

import PageTransition from "@/components/layout/PageTransition";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button-custom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card-custom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityLog } from "@/contexts/ActivityLogContext";

// Define the form schema
const formSchema = z.object({
  mealType: z.string().min(1, { message: "Please select a meal type" }),
  foodItems: z.string().optional(),
  calories: z.coerce.number().min(0, { message: "Calories must be a positive number" }).optional(),
  protein: z.coerce.number().min(0, { message: "Protein must be a positive number" }).optional(),
  carbs: z.coerce.number().min(0, { message: "Carbs must be a positive number" }).optional(),
  fat: z.coerce.number().min(0, { message: "Fat must be a positive number" }).optional(),
});

const LogMeal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [scannedFood, setScannedFood] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logActivity } = useActivityLog();

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealType: "",
      foodItems: "",
      calories: undefined,
      protein: undefined,
      carbs: undefined,
      fat: undefined,
    },
  });

  useEffect(() => {
    // Check if there's scanned food data in session storage
    const storedFood = sessionStorage.getItem("scannedFood");
    if (storedFood) {
      try {
        const parsedFood = JSON.parse(storedFood);
        setScannedFood(parsedFood);
        
        // Pre-fill the form with the scanned food data
        form.setValue("calories", parsedFood.calories || 0);
        form.setValue("protein", parsedFood.protein || 0);
        form.setValue("carbs", parsedFood.carbs || 0);
        form.setValue("fat", parsedFood.fat || 0);
        
        // If the food has ingredients, set them in the foodItems field
        if (parsedFood.ingredients && Array.isArray(parsedFood.ingredients)) {
          const ingredientNames = parsedFood.ingredients
            .map((ing: any) => ing.name || ing)
            .filter((name: string) => name && name !== "No ingredient data available")
            .join(", ");
          
          if (ingredientNames) {
            form.setValue("foodItems", ingredientNames);
          }
        }
        
        // Clear the session storage to prevent the data from being used again
        sessionStorage.removeItem("scannedFood");
      } catch (error) {
        console.error("Error parsing scanned food data:", error);
      }
    }
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const now = new Date();
      const formattedDate = format(now, "yyyy-MM-dd");
      const mealDescription = `Logged ${values.mealType} meal`;
      
      // Create the metadata object
      const metadata: any = {
        meal_type: values.mealType,
        date: formattedDate,
        food_items: values.foodItems ? values.foodItems.split(",").map(item => item.trim()) : []
      };
      
      // Include the complete scanned food data if available
      if (scannedFood) {
        metadata.scanned_food = scannedFood;
      } else if (values.calories || values.protein || values.carbs || values.fat) {
        // If no scanned food but user entered nutritional values
        metadata.scanned_food = {
          name: values.mealType.charAt(0).toUpperCase() + values.mealType.slice(1),
          calories: values.calories || 0,
          protein: values.protein || 0,
          carbs: values.carbs || 0,
          fat: values.fat || 0
        };
      }
      
      // Log the meal using the ActivityLogContext
      await logActivity('meal_logged', {
        description: mealDescription,
        metadata
      });
      
      toast({
        title: "Meal logged successfully",
        description: `Your ${values.mealType} has been recorded.`,
      });
      
      navigate("/nutrition");
    } catch (error: any) {
      console.error("Error logging meal:", error);
      toast({
        title: "Error logging meal",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <Header title="Log Meal" />
      <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mr-3">
                  <Utensils className="text-white h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Log Your Meal</h1>
                  <p className="text-sm text-muted-foreground">Track what you've eaten</p>
                </div>
              </div>

              {scannedFood && (
                <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Analyzed Food: {scannedFood.name}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        {scannedFood.calories} cal | P: {scannedFood.protein}g, C: {scannedFood.carbs}g, F: {scannedFood.fat}g
                      </p>
                    </div>
                    {scannedFood.healthScore && (
                      <div className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded-full text-xs font-medium text-green-800 dark:text-green-200">
                        Health Score: {scannedFood.healthScore}/10
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="mealType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select meal type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                            <SelectItem value="snack">Snack</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="foodItems"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Food Items (comma separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Oats, Banana, Milk" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="calories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calories</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="protein"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Protein (g)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="carbs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carbs (g)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fat (g)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4 flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate('/scan')}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Scan Food
                    </Button>
                    <Button type="submit" variant="green-gradient" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Log Meal
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

export default LogMeal;

