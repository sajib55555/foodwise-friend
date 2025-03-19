
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NutritionSummary: React.FC = () => {
  // Example data for nutrition summary
  const nutrients = [
    { name: "Calories", value: 1200, target: 2000, color: "bg-amber-500", bgColor: "bg-amber-100/50 dark:bg-amber-950/30", textColor: "text-amber-700 dark:text-amber-300" },
    { name: "Protein", value: 50, target: 80, color: "bg-blue-500", bgColor: "bg-blue-100/50 dark:bg-blue-950/30", textColor: "text-blue-700 dark:text-blue-300" },
    { name: "Carbs", value: 120, target: 200, color: "bg-green-500", bgColor: "bg-green-100/50 dark:bg-green-950/30", textColor: "text-green-700 dark:text-green-300" },
    { name: "Fat", value: 35, target: 65, color: "bg-orange-500", bgColor: "bg-orange-100/50 dark:bg-orange-950/30", textColor: "text-orange-700 dark:text-orange-300" }
  ];

  const mealHistory = [
    { name: "Breakfast", calories: 350, time: "8:30 AM", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=100&auto=format&fit=crop", color: "from-amber-500/20 to-amber-400/10" },
    { name: "Lunch", calories: 520, time: "12:45 PM", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100&auto=format&fit=crop", color: "from-blue-500/20 to-blue-400/10" },
    { name: "Snack", calories: 180, time: "3:15 PM", image: "https://images.unsplash.com/photo-1604423043492-41cf507c7e61?q=80&w=100&auto=format&fit=crop", color: "from-green-500/20 to-green-400/10" }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4"
      >
        {nutrients.map((nutrient, i) => (
          <motion.div key={nutrient.name} variants={item}>
            <Card variant="glass-sm" className={cn("overflow-hidden border border-white/20", nutrient.bgColor)}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={cn("text-sm font-medium", nutrient.textColor)}>{nutrient.name}</span>
                    <span className={cn("text-sm", nutrient.textColor)}>
                      {nutrient.value}/{nutrient.target}
                      {nutrient.name === "Calories" ? " kcal" : "g"}
                    </span>
                  </div>
                  <Progress
                    value={(nutrient.value / nutrient.target) * 100}
                    className={cn("h-2", "bg-white/30")}
                    indicatorClassName={nutrient.color}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="glass" className="border border-purple-300/30 dark:border-purple-800/20 bg-gradient-to-br from-purple-50/80 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/10">
          <CardHeader className="pb-2 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500 rounded-full opacity-20"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500 rounded-full opacity-20"></div>
            </div>
            <CardTitle className="text-base bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-bold relative z-10">Today's Meals</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {mealHistory.map((meal, index) => (
                <motion.li
                  key={`${meal.name}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={cn(
                    "flex items-center space-x-3 p-2 rounded-lg transition-colors",
                    "bg-gradient-to-r", meal.color,
                    "hover:shadow-md border border-white/30 backdrop-blur-sm"
                  )}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md border border-white/40">
                    <img 
                      src={meal.image} 
                      alt={meal.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{meal.name}</p>
                    <p className="text-xs text-muted-foreground">{meal.time}</p>
                  </div>
                  <div className="text-sm font-medium px-2 py-1 rounded-full bg-white/60 backdrop-blur-sm shadow-sm">
                    {meal.calories} kcal
                  </div>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NutritionSummary;
