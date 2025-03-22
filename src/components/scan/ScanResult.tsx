import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Check, X, AlertTriangle, Utensils, Activity, Barcode, Loader2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DetailedNutritionAnalysis from "@/components/nutrition/DetailedNutritionAnalysis";

interface Ingredient {
  name: string;
  healthy: boolean;
  warning?: string;
}

interface FoodAnalysis {
  name: string;
  brand?: string;
  barcode?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Ingredient[];
  healthScore: number;
  warnings: string[];
  recommendations: string[];
  servingSize: string;
  vitamins: { name: string; amount: string }[];
  minerals: { name: string; amount: string }[];
  dietary: {
    vegan: boolean;
    vegetarian: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
}

interface ScanResultProps {
  imageUrl: string;
  barcode?: string | null;
  onReset: () => void;
}

const ScanResult: React.FC<ScanResultProps> = ({ imageUrl, barcode, onReset }) => {
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawAnalysis, setRawAnalysis] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const analyzeFoodImage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setRawAnalysis(null);

        console.log("Analyzing food image or barcode...");
        if (barcode) {
          console.log("Analyzing barcode:", barcode);
        } else if (imageUrl) {
          console.log("Analyzing image data of length:", imageUrl.length);
        }

        const timeout = setTimeout(() => {
          if (isLoading) {
            console.log("Analysis timeout reached");
            throw new Error("Analysis took too long. Please try again.");
          }
        }, 30000); // 30 second timeout
        
        setTimeoutId(timeout);

        try {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Analysis request timed out')), 25000);
          });

          const functionPromise = supabase.functions.invoke("analyze-food", {
            body: {
              imageData: imageUrl,
              barcode: barcode
            }
          });

          const result = await Promise.race([functionPromise, timeoutPromise]);
          
          const { data, error } = result as { data: any, error: any };

          if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
          }

          if (error) {
            console.error("Supabase function error:", error);
            throw new Error(error.message || "Failed to analyze food");
          }

          if (!data) {
            console.error("No data returned from analysis");
            throw new Error("No analysis data returned. Please try again.");
          }

          console.log("Received analysis data:", data ? "success" : "no data");
          
          if (data.rawAnalysis) {
            console.log("Raw analysis available");
            setRawAnalysis(data.rawAnalysis);
            
            try {
              if (data.rawAnalysis.includes('{') && data.rawAnalysis.includes('}')) {
                let jsonStr = data.rawAnalysis;
                
                if (jsonStr.includes('```json')) {
                  jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
                } else if (jsonStr.includes('```')) {
                  jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
                }
                
                jsonStr = jsonStr
                  .replace(/"healthy"\s*:\s*moderate/g, '"healthy": false')
                  .replace(/"healthy"\s*:\s*high/g, '"healthy": false')
                  .replace(/"healthy"\s*:\s*low/g, '"healthy": true');
                
                console.log("Attempting to parse cleaned JSON");
                
                const parsedData = JSON.parse(jsonStr);
                if (parsedData && typeof parsedData === 'object') {
                  console.log("Successfully parsed raw JSON data");
                  
                  if (parsedData.ingredients && Array.isArray(parsedData.ingredients)) {
                    parsedData.ingredients = parsedData.ingredients.map(ingredient => {
                      if (typeof ingredient.healthy === 'undefined') {
                        ingredient.healthy = true;
                      }
                      if (typeof ingredient.healthy !== 'boolean') {
                        const originalValue = ingredient.healthy;
                        ingredient.healthy = false;
                        if (!ingredient.warning && originalValue) {
                          ingredient.warning = `Moderate (${originalValue})`;
                        }
                      }
                      return ingredient;
                    });
                  }
                  
                  setAnalysis(parsedData);
                  setError(null);
                  
                  toast({
                    title: "Food Analysis Complete",
                    description: `Analyzed: ${parsedData.name}`,
                  });
                  
                  return;
                }
              }
            } catch (jsonErr) {
              console.error("Error parsing raw JSON:", jsonErr);
            }
          }

          if (data.productInfo) {
            setAnalysis(data.productInfo);
            
            if (data.productInfo.name !== "Food Analysis Result") {
              toast({
                title: "Food Analysis Complete",
                description: `Analyzed: ${data.productInfo.name}`,
              });
            } else {
              toast({
                title: "Analysis Result Limited",
                description: "Could only get basic information. Try a clearer image.",
                variant: "default",
              });
            }
          } else {
            throw new Error('No analysis data returned');
          }
        } catch (fetchError: any) {
          if (fetchError.message?.includes('timed out')) {
            throw new Error('Analysis request timed out');
          }
          throw fetchError;
        } finally {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        }
      } catch (err: any) {
        console.error('Error analyzing food:', err);
        
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
        
        let errorMessage = 'Failed to analyze food image. Please try again with a clearer photo.';
        
        if (err.message?.includes('timeout') || err.message?.includes('timed out')) {
          errorMessage = 'The analysis took too long. Please try again with a clearer photo or a different food item.';
        } else if (err.message?.includes('network')) {
          errorMessage = 'Network error occurred. Please check your connection and try again.';
        }
        
        setError(errorMessage);
        
        toast({
          title: "Analysis Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (imageUrl || barcode) {
      analyzeFoodImage();
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [imageUrl, barcode, toast]);

  const handleLogFood = () => {
    if (analysis) {
      sessionStorage.setItem('scannedFood', JSON.stringify(analysis));
      
      navigate('/log-meal');
      
      toast({
        title: "Food Ready to Log",
        description: `${analysis.name} has been added to your meal form.`,
      });
    }
  };

  const handleUseFallbackData = () => {
    const fallbackBurgerData: FoodAnalysis = {
      name: "Cheeseburger",
      calories: 450,
      protein: 25,
      carbs: 35,
      fat: 22,
      ingredients: [
        { name: "Beef patty", healthy: true },
        { name: "Cheese", healthy: false, warning: "High in saturated fat" },
        { name: "Lettuce", healthy: true },
        { name: "Tomato", healthy: true },
        { name: "Onion", healthy: true },
        { name: "Bun", healthy: false, warning: "Refined carbs" },
        { name: "Sauce", healthy: false, warning: "May contain added sugars" }
      ],
      healthScore: 5.5,
      warnings: ["Moderate in calories", "Contains saturated fat", "Contains refined carbs"],
      recommendations: ["Pair with a side salad", "Choose whole grain bun for more fiber", "Limit additional condiments"],
      servingSize: "1 burger (180g)",
      vitamins: [
        { name: "Vitamin A", amount: "5% DV" },
        { name: "Vitamin C", amount: "8% DV" }
      ],
      minerals: [
        { name: "Calcium", amount: "15% DV" },
        { name: "Iron", amount: "20% DV" }
      ],
      dietary: {
        vegan: false,
        vegetarian: false,
        glutenFree: false,
        dairyFree: false
      }
    };
    
    setAnalysis(fallbackBurgerData);
    setError(null);
    setRawAnalysis(null);
    
    toast({
      title: "Using Sample Data",
      description: "Using sample data for demonstration purposes",
    });
  };

  const fallbackAnalysis: FoodAnalysis = {
    name: "Unknown Food Item",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    ingredients: [],
    healthScore: 5,
    warnings: ["Unable to analyze food"],
    recommendations: ["Try scanning again with better lighting"],
    servingSize: "100g",
    vitamins: [],
    minerals: [],
    dietary: {
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      dairyFree: false
    }
  };

  const displayData = analysis || fallbackAnalysis;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="relative">
        {imageUrl ? (
          <div className="h-48 rounded-2xl overflow-hidden">
            <img
              src={imageUrl}
              alt="Food scan"
              className="w-full h-full object-cover"
            />
          </div>
        ) : barcode ? (
          <div className="h-48 rounded-2xl flex items-center justify-center bg-purple-50 overflow-hidden">
            <div className="text-center p-4">
              <Barcode className="h-16 w-16 mx-auto mb-2 text-purple-600" />
              <p className="text-lg font-semibold text-purple-700">{barcode}</p>
              <p className="text-sm text-purple-600">{displayData.brand || "Unknown Product"}</p>
            </div>
          </div>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm"
          onClick={onReset}
        >
          New Scan
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-2" />
          <p className="text-purple-700 font-medium">Analyzing your food...</p>
          <p className="text-sm text-muted-foreground">This may take a moment</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-6"
            onClick={onReset}
          >
            Cancel Analysis
          </Button>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                <p className="text-lg font-medium mb-2">Analysis Failed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <div className="flex flex-col sm:flex-row gap-2 mt-6 justify-center">
                  <Button 
                    variant="purple" 
                    onClick={onReset}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleUseFallbackData}
                  >
                    Use Sample Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  {displayData.name}
                  {displayData.name === "Food Analysis Result" && (
                    <Info className="h-4 w-4 ml-2 text-amber-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Calories</p>
                    <p className="font-semibold">{displayData.calories}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="font-semibold">{displayData.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <p className="font-semibold">{displayData.carbs}g</p>
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
                  <div className="text-lg font-semibold text-green-600">{displayData.healthScore}/10</div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Ingredients:</p>
                  {displayData.ingredients.length > 0 ? (
                    <ul className="space-y-1">
                      {displayData.ingredients.map((ingredient, index) => (
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
                  ) : (
                    <p className="text-sm text-muted-foreground">No ingredient data available</p>
                  )}
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
                {displayData.warnings.length > 0 && (
                  <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Considerations</p>
                        <ul className="mt-1 text-xs text-amber-600 dark:text-amber-300 space-y-1">
                          {displayData.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <ul className="space-y-2">
                  {displayData.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Activity className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4 flex space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      toast({
                        title: "Saved to Journal",
                        description: "Food information has been saved to your journal",
                      });
                    }}
                  >
                    Save to Journal
                  </Button>
                  <Button 
                    variant="purple" 
                    size="sm" 
                    className="flex-1"
                    onClick={handleLogFood}
                  >
                    Log This Meal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {displayData.name !== "Food Analysis Result" && displayData.name !== "Unknown Food Item" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <DetailedNutritionAnalysis nutritionData={displayData} />
            </motion.div>
          )}

          {rawAnalysis && displayData.name === "Food Analysis Result" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card variant="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Info className="h-4 w-4 mr-2 text-purple-500" />
                    We detected your food but had trouble with the analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Our AI recognized your food but had trouble formatting the nutritional data. 
                    Try taking a clearer photo with good lighting and a single food item centered in the frame.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={onReset}
                  >
                    Scan Again
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ScanResult;
