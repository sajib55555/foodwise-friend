
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

        // Call the Supabase Edge Function
        const { data, error } = await supabase.functions.invoke("analyze-food", {
          body: {
            imageData: imageUrl,
            barcode: barcode
          },
        });

        if (error) {
          console.error("Supabase function error:", error);
          throw new Error(error.message);
        }

        console.log("Received analysis data:", data ? "success" : "no data");
        
        if (data.rawAnalysis) {
          console.log("Raw analysis available");
          setRawAnalysis(data.rawAnalysis);
          
          // Try to manually parse the raw analysis if it looks like JSON
          try {
            if (data.rawAnalysis.includes('{') && data.rawAnalysis.includes('}')) {
              // Extract JSON from potential markdown code blocks
              let jsonStr = data.rawAnalysis;
              if (jsonStr.includes('```json')) {
                jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
              } else if (jsonStr.includes('```')) {
                jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
              }
              
              const parsedData = JSON.parse(jsonStr);
              if (parsedData && typeof parsedData === 'object') {
                console.log("Successfully parsed raw JSON data");
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

        // If we reach here, use the standard productInfo
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
      } catch (err) {
        console.error('Error analyzing food:', err);
        setError('Failed to analyze food image. Please try again with a clearer photo.');
        toast({
          title: "Analysis Failed",
          description: "We couldn't analyze the food image. Please try again with a clearer photo.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (imageUrl || barcode) {
      analyzeFoodImage();
    }
  }, [imageUrl, barcode, toast]);

  // Handle logging the food to meal journal
  const handleLogFood = () => {
    if (analysis) {
      // Store the analyzed food in session storage to retrieve in LogMeal
      sessionStorage.setItem('scannedFood', JSON.stringify({
        name: analysis.name,
        calories: analysis.calories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat
      }));
      
      // Navigate to the log meal page
      navigate('/log-meal');
      
      toast({
        title: "Food Ready to Log",
        description: `${analysis.name} has been added to your meal form.`,
      });
    }
  };

  // Fallback if analysis fails
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

  // Use either the analysis result or fallback
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
        </div>
      ) : error && !rawAnalysis ? (
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
                <Button 
                  variant="purple" 
                  className="mt-4"
                  onClick={onReset}
                >
                  Try Again
                </Button>
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

          {/* Only show detailed nutrition when we have good data */}
          {displayData.name !== "Food Analysis Result" && displayData.name !== "Unknown Food Item" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <DetailedNutritionAnalysis nutritionData={displayData} />
            </motion.div>
          )}

          {/* If we have raw analysis but couldn't parse it properly, show a message */}
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
