
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
      },
      {
        day: "Wednesday",
        meals: [
          { type: "Breakfast", foods: ["Overnight oats with almond milk", "Cinnamon"] },
          { type: "Lunch", foods: ["Turkey and vegetable soup", "Side salad"] },
          { type: "Dinner", foods: ["Baked cod", "Roasted Brussels sprouts", "Quinoa (small portion)"] },
          { type: "Snack", foods: ["Apple slices", "Almond butter (1 tbsp)"] }
        ]
      },
      {
        day: "Thursday",
        meals: [
          { type: "Breakfast", foods: ["Green smoothie", "Plant protein powder"] },
          { type: "Lunch", foods: ["Chicken and vegetable stir-fry", "Cauliflower rice"] },
          { type: "Dinner", foods: ["Grilled shrimp", "Zucchini noodles", "Tomato sauce"] },
          { type: "Snack", foods: ["Carrot sticks", "Hummus (2 tbsp)"] }
        ]
      },
      {
        day: "Friday",
        meals: [
          { type: "Breakfast", foods: ["Cottage cheese", "Mixed berries", "Cinnamon"] },
          { type: "Lunch", foods: ["Mediterranean bowl", "Chickpeas", "Feta (small amount)"] },
          { type: "Dinner", foods: ["Turkey meatballs", "Spaghetti squash", "Marinara sauce"] },
          { type: "Snack", foods: ["Cucumber slices", "Tzatziki (2 tbsp)"] }
        ]
      },
      {
        day: "Saturday",
        meals: [
          { type: "Breakfast", foods: ["Protein pancakes (low-carb mix)", "Berries"] },
          { type: "Lunch", foods: ["Cobb salad (no bacon)", "Avocado", "Light dressing"] },
          { type: "Dinner", foods: ["Roasted salmon", "Asparagus", "Wild rice (small portion)"] },
          { type: "Snack", foods: ["Rice cake", "Light cream cheese"] }
        ]
      },
      {
        day: "Sunday",
        meals: [
          { type: "Breakfast", foods: ["Vegetable frittata", "Fresh herbs"] },
          { type: "Lunch", foods: ["Lentil soup", "Mixed greens salad"] },
          { type: "Dinner", foods: ["Grilled lean steak (small portion)", "Mushrooms", "Green beans"] },
          { type: "Snack", foods: ["String cheese", "Cherry tomatoes"] }
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
      },
      {
        day: "Wednesday",
        meals: [
          { type: "Breakfast", foods: ["Greek yogurt", "Granola", "Honey", "Whey protein"] },
          { type: "Lunch", foods: ["Beef and vegetable stir-fry", "Brown rice (large portion)"] },
          { type: "Dinner", foods: ["Chicken thighs", "Sweet potato", "Spinach salad"] },
          { type: "Snack", foods: ["Protein bar", "Banana"] }
        ]
      },
      {
        day: "Thursday",
        meals: [
          { type: "Breakfast", foods: ["Protein smoothie", "Oats", "Peanut butter", "Banana"] },
          { type: "Lunch", foods: ["Tuna wrap", "Avocado", "Greek yogurt sauce"] },
          { type: "Dinner", foods: ["Ground turkey", "Pasta", "Tomato sauce", "Parmesan"] },
          { type: "Snack", foods: ["Hard-boiled eggs (2)", "Whole grain crackers"] }
        ]
      },
      {
        day: "Friday",
        meals: [
          { type: "Breakfast", foods: ["Breakfast burrito", "Eggs", "Black beans", "Cheese"] },
          { type: "Lunch", foods: ["Grilled chicken sandwich", "Whole grain bread", "Side salad"] },
          { type: "Dinner", foods: ["Baked cod", "Quinoa", "Roasted Brussels sprouts"] },
          { type: "Snack", foods: ["Trail mix", "Dried fruits", "Nuts"] }
        ]
      },
      {
        day: "Saturday",
        meals: [
          { type: "Breakfast", foods: ["French toast", "Maple syrup", "Greek yogurt", "Berries"] },
          { type: "Lunch", foods: ["Lean beef burger", "Whole grain bun", "Sweet potato fries"] },
          { type: "Dinner", foods: ["Grilled chicken", "Rice pilaf", "Grilled vegetables"] },
          { type: "Snack", foods: ["Protein shake", "Almond butter toast"] }
        ]
      },
      {
        day: "Sunday",
        meals: [
          { type: "Breakfast", foods: ["Egg and vegetable scramble", "Whole grain toast", "Avocado"] },
          { type: "Lunch", foods: ["Salmon poke bowl", "Brown rice", "Edamame"] },
          { type: "Dinner", foods: ["Slow-cooked beef", "Baked potato", "Broccoli"] },
          { type: "Snack", foods: ["Greek yogurt", "Honey", "Walnuts"] }
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
        {/* Plan Selection Card */}
        <Card className="glass-card mb-6 border border-purple-200/30 shadow-purple-lg/10">
          <CardHeader className="bg-gradient-to-r from-purple-50/30 to-purple-100/30">
            <CardTitle className="text-lg font-semibold text-purple-800">Select a Meal Plan</CardTitle>
            <CardDescription className="text-purple-600">Choose a plan that fits your goals</CardDescription>
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
                  className={`relative cursor-pointer border transition-all ${
                    selectedPlan === plan.id 
                      ? "bg-gradient-to-r from-purple-100/40 to-purple-200/40 border-purple-300/50 shadow-purple-sm" 
                      : "bg-background/50 border-purple-100/20 hover:bg-purple-50/20"
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.isPremium && !hasPremiumAccess && (
                    <div className="absolute top-0 right-0 bg-gradient-premium text-white px-2 py-1 text-xs rounded-bl-lg rounded-tr-lg flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Premium
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium flex items-center gap-2 text-purple-700">
                      {plan.icon}
                      {plan.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-purple-600/80">{plan.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* 7-Day Plan Card */}
        {plan && (
          <Card className="glass-card border border-purple-200/30 shadow-purple-lg/10">
            <CardHeader className="bg-gradient-to-r from-purple-50/30 to-purple-100/30">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-purple-800">
                  <CalendarDays className="h-5 w-5 text-purple-500" />
                  7-Day Plan
                </CardTitle>
              </div>
              <CardDescription className="text-purple-600">{plan.name} - Weekly Schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={plan.days[0].day.toLowerCase()} className="w-full">
                {/* Modified ScrollArea and TabsList to ensure all days are visible */}
                <div className="relative mb-2 overflow-hidden">
                  <ScrollArea className="w-full" orientation="horizontal">
                    <div className="flex min-w-max pb-2 pr-2">
                      <TabsList className="flex min-w-max bg-gradient-to-r from-purple-100/50 to-purple-200/50 rounded-lg p-1 space-x-1">
                        {plan.days.map((day, index) => (
                          <TabsTrigger
                            key={day.day}
                            value={day.day.toLowerCase()}
                            onClick={() => setSelectedDay(index)}
                            className="data-[state=active]:bg-gradient-premium data-[state=active]:text-white rounded-md px-6 py-2 whitespace-nowrap flex-shrink-0 text-purple-700"
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
                        className="p-4 rounded-lg bg-gradient-to-r from-purple-50/30 to-purple-100/20 border border-purple-100/30"
                      >
                        <h3 className="font-medium text-purple-700 mb-2">{meal.type}</h3>
                        <ul className="space-y-1">
                          {meal.foods.map((food, foodIndex) => (
                            <li key={foodIndex} className="text-sm flex items-center gap-2 text-purple-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block"></span>
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
            <CardFooter className="bg-gradient-to-r from-purple-50/30 to-purple-100/30 rounded-b-lg">
              <Button 
                variant="premium" 
                className="w-full text-white"
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
