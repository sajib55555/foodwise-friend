
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertTriangle, Info } from "lucide-react";

interface NutrientProps {
  name: string;
  amount: string;
}

const Nutrient: React.FC<NutrientProps> = ({ name, amount }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-sm">{name}</span>
    <span className="text-sm font-medium">{amount}</span>
  </div>
);

interface DetailedNutritionAnalysisProps {
  nutritionData: {
    name: string;
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: { name: string; healthy: boolean; warning?: string }[];
    healthScore: number;
    warnings: string[];
    recommendations: string[];
    vitamins: { name: string; amount: string }[];
    minerals: { name: string; amount: string }[];
    dietary: {
      vegan: boolean;
      vegetarian: boolean;
      glutenFree: boolean;
      dairyFree: boolean;
    };
  } | null;
}

const DetailedNutritionAnalysis: React.FC<DetailedNutritionAnalysisProps> = ({ nutritionData }) => {
  if (!nutritionData) return null;

  const healthScoreColor = () => {
    const score = nutritionData.healthScore;
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    if (score >= 4) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-4">
      <Card variant="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{nutritionData.name}</CardTitle>
          <div className="flex flex-wrap gap-2 mt-1">
            {nutritionData.dietary.vegan && <Badge variant="outline" className="bg-green-100/50">Vegan</Badge>}
            {nutritionData.dietary.vegetarian && <Badge variant="outline" className="bg-green-100/50">Vegetarian</Badge>}
            {nutritionData.dietary.glutenFree && <Badge variant="outline" className="bg-amber-100/50">Gluten-Free</Badge>}
            {nutritionData.dietary.dairyFree && <Badge variant="outline" className="bg-blue-100/50">Dairy-Free</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-between border-b pb-3">
            <div className="text-center px-2 flex-1">
              <p className="text-xs text-muted-foreground">Calories</p>
              <p className="text-lg font-semibold">{nutritionData.calories}</p>
            </div>
            <div className="text-center px-2 flex-1">
              <p className="text-xs text-muted-foreground">Protein</p>
              <p className="text-lg font-semibold">{nutritionData.protein}g</p>
            </div>
            <div className="text-center px-2 flex-1">
              <p className="text-xs text-muted-foreground">Carbs</p>
              <p className="text-lg font-semibold">{nutritionData.carbs}g</p>
            </div>
            <div className="text-center px-2 flex-1">
              <p className="text-xs text-muted-foreground">Fat</p>
              <p className="text-lg font-semibold">{nutritionData.fat}g</p>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-sm font-medium mb-1">Health Score</p>
            <div className="flex items-center">
              <div className={`text-2xl font-bold ${healthScoreColor()}`}>{nutritionData.healthScore}/10</div>
              <div className="ml-3 text-sm text-muted-foreground">{nutritionData.servingSize} serving</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="glass-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {nutritionData.ingredients.map((ingredient, index) => (
                <li key={`ingredient-${index}`} className="flex items-center justify-between text-sm">
                  <span>{ingredient.name}</span>
                  {ingredient.healthy ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <div className="flex items-center">
                      <X size={16} className="text-red-500 mr-1" />
                      {ingredient.warning && (
                        <span className="text-xs text-red-500">{ingredient.warning}</span>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card variant="glass-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Warnings & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {nutritionData.warnings.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium mb-1 flex items-center">
                  <AlertTriangle size={14} className="text-amber-500 mr-1" /> Warnings
                </p>
                <ul className="space-y-1 pl-5 list-disc">
                  {nutritionData.warnings.map((warning, index) => (
                    <li key={`warning-${index}`} className="text-xs text-muted-foreground">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {nutritionData.recommendations.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1 flex items-center">
                  <Info size={14} className="text-blue-500 mr-1" /> Recommendations
                </p>
                <ul className="space-y-1 pl-5 list-disc">
                  {nutritionData.recommendations.map((rec, index) => (
                    <li key={`rec-${index}`} className="text-xs text-muted-foreground">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="glass-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Vitamins</CardTitle>
          </CardHeader>
          <CardContent>
            {nutritionData.vitamins.length > 0 ? (
              <div className="space-y-1">
                {nutritionData.vitamins.map((vitamin, index) => (
                  <Nutrient 
                    key={`vitamin-${index}`}
                    name={vitamin.name} 
                    amount={vitamin.amount} 
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No vitamin data available</p>
            )}
          </CardContent>
        </Card>

        <Card variant="glass-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Minerals</CardTitle>
          </CardHeader>
          <CardContent>
            {nutritionData.minerals.length > 0 ? (
              <div className="space-y-1">
                {nutritionData.minerals.map((mineral, index) => (
                  <Nutrient 
                    key={`mineral-${index}`}
                    name={mineral.name} 
                    amount={mineral.amount} 
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No mineral data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DetailedNutritionAnalysis;
