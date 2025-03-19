
import React, { useState } from "react";
import { motion } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { Button } from "@/components/ui/button-custom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, Lock, Salad, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Sample meal plan data
const mealPlans = [
  {
    id: "balanced",
    name: "Balanced Plan",
    description: "A well-rounded plan with a balance of proteins, carbs, and healthy fats.",
    icon: <Salad className="h-5 w-5 text-green-500" />,
    isPremium: false,
    days: [
      {
        day: "Monday",
        meals: [
          { type: "Breakfast", foods: ["Oatmeal with berries", "Greek yogurt"] },
          { type: "Lunch", foods: ["Grilled chicken salad", "Whole grain bread"] },
          { type: "Dinner", foods: ["Baked salmon", "Steamed vegetables", "Quinoa"] },
          { type: "Snack", foods: ["Apple", "Almonds"] }
        ]
      },
      {
        day: "Tuesday",
        meals: [
          { type: "Breakfast", foods: ["Whole grain toast", "Scrambled eggs", "Avocado"] },
          { type: "Lunch", foods: ["Turkey wrap", "Mixed greens", "Fruit"] },
          { type: "Dinner", foods: ["Lean beef stir fry", "Brown rice"] },
          { type: "Snack", foods: ["Carrot sticks", "Hummus"] }
        ]
      },
      {
        day: "Wednesday",
        meals: [
          { type: "Breakfast", foods: ["Greek yogurt parfait", "Granola", "Berries"] },
          { type: "Lunch", foods: ["Quinoa bowl", "Roasted vegetables", "Chickpeas"] },
          { type: "Dinner", foods: ["Grilled chicken", "Sweet potato", "Broccoli"] },
          { type: "Snack", foods: ["Banana", "Peanut butter"] }
        ]
      },
      {
        day: "Thursday",
        meals: [
          { type: "Breakfast", foods: ["Smoothie bowl", "Chia seeds", "Sliced banana"] },
          { type: "Lunch", foods: ["Mediterranean salad", "Feta cheese", "Olives"] },
          { type: "Dinner", foods: ["Baked cod", "Roasted vegetables", "Brown rice"] },
          { type: "Snack", foods: ["Trail mix", "Dried fruit"] }
        ]
      },
      {
        day: "Friday",
        meals: [
          { type: "Breakfast", foods: ["Overnight oats", "Sliced apple", "Cinnamon"] },
          { type: "Lunch", foods: ["Lentil soup", "Whole grain roll", "Side salad"] },
          { type: "Dinner", foods: ["Turkey meatballs", "Whole wheat pasta", "Tomato sauce"] },
          { type: "Snack", foods: ["Cucumber slices", "Tzatziki dip"] }
        ]
      },
      {
        day: "Saturday",
        meals: [
          { type: "Breakfast", foods: ["Vegetable omelette", "Whole grain toast", "Avocado"] },
          { type: "Lunch", foods: ["Tuna sandwich", "Lettuce", "Tomato"] },
          { type: "Dinner", foods: ["Grilled steak (small portion)", "Roasted potatoes", "Asparagus"] },
          { type: "Snack", foods: ["Greek yogurt", "Honey", "Mixed berries"] }
        ]
      },
      {
        day: "Sunday",
        meals: [
          { type: "Breakfast", foods: ["Whole grain pancakes", "Fresh fruit", "Maple syrup"] },
          { type: "Lunch", foods: ["Buddha bowl", "Brown rice", "Mixed vegetables", "Tofu"] },
          { type: "Dinner", foods: ["Baked chicken", "Quinoa", "Roasted Brussels sprouts"] },
          { type: "Snack", foods: ["Dark chocolate square", "Orange slices"] }
        ]
      }
    ]
  },
  {
    id: "weight-loss",
    name: "Weight Loss Plan",
    description: "Calorie-controlled plan focused on lean proteins and vegetables.",
    icon: <Zap className="h-5 w-5 text-purple-500" />,
    isPremium: true,
    days: [
      {
        day: "Monday",
        meals: [
          { type: "Breakfast", foods: ["Protein smoothie", "Chia seeds"] },
          { type: "Lunch", foods: ["Large salad with grilled chicken", "Light dressing"] },
          { type: "Dinner", foods: ["White fish", "Steamed broccoli", "Small portion of rice"] },
          { type: "Snack", foods: ["Celery", "Cottage cheese"] }
        ]
      },
      {
        day: "Tuesday",
        meals: [
          { type: "Breakfast", foods: ["Egg white omelette", "Spinach", "Mushrooms"] },
          { type: "Lunch", foods: ["Tuna salad (no mayo)", "Cucumber slices"] },
          { type: "Dinner", foods: ["Grilled chicken breast", "Asparagus", "Sweet potato (small)"] },
          { type: "Snack", foods: ["Greek yogurt (0% fat)", "Berries"] }
        ]
      }
    ]
  },
  {
    id: "muscle-gain",
    name: "Muscle Gain Plan",
    description: "High protein plan designed to support muscle growth and recovery.",
    icon: <Zap className="h-5 w-5 text-blue-500" />,
    isPremium: true,
    days: [
      {
        day: "Monday",
        meals: [
          { type: "Breakfast", foods: ["Protein pancakes", "Banana", "Peanut butter"] },
          { type: "Lunch", foods: ["Chicken and rice bowl", "Avocado", "Black beans"] },
          { type: "Dinner", foods: ["Steak", "Sweet potato", "Broccoli"] },
          { type: "Snack", foods: ["Protein shake", "Nuts"] }
        ]
      },
      {
        day: "Tuesday",
        meals: [
          { type: "Breakfast", foods: ["Eggs (4-5)", "Oatmeal", "Berries"] },
          { type: "Lunch", foods: ["Turkey and cheese sandwich", "Spinach", "Apple"] },
          { type: "Dinner", foods: ["Salmon", "Quinoa", "Roasted vegetables"] },
          { type: "Snack", foods: ["Cottage cheese", "Pineapple"] }
        ]
      }
    ]
  }
];

const MealPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("balanced");
  const [selectedDay, setSelectedDay] = useState(0);

  const plan = mealPlans.find(p => p.id === selectedPlan);
  const hasPremiumAccess = true; // In a real app, check subscription status

  const handleSelectPlan = (planId: string) => {
    const plan = mealPlans.find(p => p.id === planId);
    if (plan?.isPremium && !hasPremiumAccess) {
      // Show premium required message
      return;
    }
    setSelectedPlan(planId);
  };

  return (
    <PageTransition>
      <Header title="Meal Plans" showBackButton />
      <main className="container max-w-md mx-auto px-4 pb-24 pt-20">
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Select a Meal Plan</CardTitle>
            <CardDescription>Choose a plan that fits your goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mealPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`relative cursor-pointer border border-purple-100/20 hover:bg-purple-50/10 transition-all ${
                    selectedPlan === plan.id ? "bg-purple-50/20 border-purple-200/50" : "bg-background/50"
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.isPremium && !hasPremiumAccess && (
                    <div className="absolute top-0 right-0 bg-purple-500 text-white px-2 py-1 text-xs rounded-bl-lg rounded-tr-lg flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Premium
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium flex items-center gap-2">
                      {plan.icon}
                      {plan.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {plan && (
          <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-purple-500" />
                  7-Day Plan
                </CardTitle>
              </div>
              <CardDescription>{plan.name} - Weekly Schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={plan.days[0].day.toLowerCase()} className="w-full">
                {/* Modified ScrollArea and TabsList to ensure all days are visible */}
                <div className="relative mb-2 overflow-hidden">
                  <ScrollArea className="w-full" orientation="horizontal">
                    <div className="flex min-w-max pb-2 pr-2">
                      <TabsList className="flex min-w-max bg-background/50 rounded-lg p-1 space-x-1">
                        {plan.days.map((day, index) => (
                          <TabsTrigger
                            key={day.day}
                            value={day.day.toLowerCase()}
                            onClick={() => setSelectedDay(index)}
                            className="data-[state=active]:bg-purple-100/50 data-[state=active]:text-purple-800 rounded-md px-6 py-2 whitespace-nowrap flex-shrink-0"
                          >
                            {day.day}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  </ScrollArea>
                </div>

                {plan.days.map((day, index) => (
                  <TabsContent 
                    key={day.day} 
                    value={day.day.toLowerCase()}
                    className="space-y-4"
                  >
                    {day.meals.map((meal, mealIndex) => (
                      <div 
                        key={mealIndex} 
                        className="p-4 rounded-lg bg-background/30 border border-purple-100/20"
                      >
                        <h3 className="font-medium text-purple-700 mb-2">{meal.type}</h3>
                        <ul className="space-y-1">
                          {meal.foods.map((food, foodIndex) => (
                            <li key={foodIndex} className="text-sm flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>
                              {food}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button 
                variant="purple" 
                className="w-full"
                onClick={() => navigate('/nutrition')}
              >
                Start This Plan
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

export default MealPlans;
