
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Check, X, AlertTriangle, Utensils, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface ScanResultProps {
  imageUrl: string;
  onReset: () => void;
}

const ScanResult: React.FC<ScanResultProps> = ({ imageUrl, onReset }) => {
  // This would be replaced with actual AI analysis results
  const mockResults = {
    name: "Chicken Salad with Mixed Vegetables",
    calories: 320,
    protein: 28,
    carbs: 12,
    fat: 18,
    ingredients: [
      { name: "Chicken Breast", healthy: true },
      { name: "Lettuce", healthy: true },
      { name: "Tomatoes", healthy: true },
      { name: "Olive Oil", healthy: true },
      { name: "Salt", healthy: true, warning: "In moderation" }
    ],
    healthScore: 8.5,
    warnings: ["Contains moderate sodium"],
    recommendations: ["Great choice for protein intake", "Rich in vitamins A and C"]
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="relative">
        <div className="h-48 rounded-2xl overflow-hidden">
          <img
            src={imageUrl}
            alt="Food scan"
            className="w-full h-full object-cover"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm"
          onClick={onReset}
        >
          New Scan
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{mockResults.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Calories</p>
                <p className="font-semibold">{mockResults.calories}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="font-semibold">{mockResults.protein}g</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Carbs</p>
                <p className="font-semibold">{mockResults.carbs}g</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <Utensils className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Health Score</p>
                  <p className="text-xs text-muted-foreground">Based on nutritional value</p>
                </div>
              </div>
              <div className="text-lg font-semibold text-green-600">{mockResults.healthScore}/10</div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Ingredients:</p>
              <ul className="space-y-1">
                {mockResults.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center text-sm">
                    {ingredient.healthy ? (
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                    )}
                    <span>{ingredient.name}</span>
                    {ingredient.warning && (
                      <span className="text-amber-500 text-xs ml-2">({ingredient.warning})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {mockResults.warnings.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Considerations</p>
                    <ul className="mt-1 text-xs text-amber-600 dark:text-amber-300 space-y-1">
                      {mockResults.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <ul className="space-y-2">
              {mockResults.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start text-sm">
                  <Activity className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-4 flex space-x-3">
              <Button variant="outline" size="sm" className="flex-1">
                Save to Journal
              </Button>
              <Button variant="default" size="sm" className="flex-1">
                Log This Meal
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ScanResult;
