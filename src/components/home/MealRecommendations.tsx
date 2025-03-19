
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Utensils, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button-custom";
import { motion } from "framer-motion";

const MealRecommendations = () => {
  const recommendations = [
    {
      id: 1,
      title: "Mediterranean Salad Bowl",
      description: "Fresh greens, feta, olives, and vinaigrette",
      calories: 380,
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 2,
      title: "Grilled Salmon & Quinoa",
      description: "Protein-rich meal with omega-3 fatty acids",
      calories: 450,
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 3,
      title: "Vegetable Stir Fry",
      description: "Fresh vegetables with lean protein and brown rice",
      calories: 410,
      image: "https://images.unsplash.com/photo-1512003867696-6d5ce6835040?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="glass" className="border border-green-300/30 dark:border-green-800/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-teal-50/20 dark:from-green-900/10 dark:to-teal-900/5 z-0"></div>
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-green-400/20 rounded-full blur-xl"></div>
        <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-teal-400/20 rounded-full blur-xl"></div>
        
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-base flex items-center gap-2">
            <Utensils className="h-5 w-5 text-green-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 font-bold">
              Meal Recommendations
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-3">
            {recommendations.map((meal) => (
              <div 
                key={meal.id} 
                className="flex items-center space-x-3 p-2 rounded-lg transition-colors bg-gradient-to-r from-green-100/60 to-teal-100/40 dark:from-green-900/20 dark:to-teal-900/10 border border-green-100/40 hover:shadow-md"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md border border-white/40">
                  <img 
                    src={meal.image} 
                    alt={meal.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-green-800 dark:text-green-300">{meal.title}</p>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70">{meal.description}</p>
                </div>
                <div className="text-sm font-medium px-2 py-1 rounded-full bg-white/60 backdrop-blur-sm shadow-sm text-green-700 dark:text-green-400">
                  {meal.calories} kcal
                </div>
              </div>
            ))}

            <Button 
              variant="outline" 
              className="w-full mt-2 border-green-300 bg-white/70 text-green-700 hover:bg-green-50 hover:text-green-800 transition-all shadow-sm"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View All Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MealRecommendations;
