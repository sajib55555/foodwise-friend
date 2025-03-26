
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button-custom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { CheckCircle2, Copy, HelpCircle, Loader2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityLog } from "@/contexts/ActivityLogContext";
import { supabase } from "@/integrations/supabase/client";

interface ScanResultProps {
  imageSrc: string;
  onClose: () => void;
}

// Mock data for when API fails but we want to show a result
const fallbackFoodData = {
  name: "Unknown Food",
  calories: 250,
  protein: 10,
  carbs: 30,
  fat: 8,
  healthScore: 6,
  ingredients: [
    { name: "Could not identify ingredients", healthy: false }
  ],
  warnings: ["Limited data available"],
  recommendations: ["Try taking a clearer photo"]
};

const ScanResult: React.FC<ScanResultProps> = ({ imageSrc, onClose }) => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const { logActivity } = useActivityLog();

  // This function compresses the image to reduce its size
  const compressImage = async (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Target size: lower resolution for API processing
        const maxWidth = 800;
        const maxHeight = 600;
        
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }
        
        // Create canvas and resize image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG format with reduced quality (0.7 = 70% quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      
      // Handle the input image which could be a base64 string or URL
      img.src = base64Image;
    });
  };

  useEffect(() => {
    const analyzeImage = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        // Convert image to base64 if it's a Blob
        let base64Image = imageSrc;
        if (typeof imageSrc === 'object' && imageSrc !== null) {
          base64Image = await convertBlobToBase64(imageSrc as Blob);
        }

        // Compress the image before sending it to the API
        console.log("Compressing image...");
        const compressedImage = await compressImage(base64Image);
        console.log(`Image compressed: Original length=${base64Image.length}, Compressed length=${compressedImage.length}`);
        
        // Set a reasonable timeout for the API call
        const timeoutDuration = 20000; // 20 seconds
        
        // Create a promise that rejects after timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out')), timeoutDuration);
        });
        
        // Create the actual API call promise
        const apiCallPromise = supabase.functions.invoke('analyze-food', {
          body: { imageData: compressedImage },
        });
        
        // Race the API call against the timeout
        const result = await Promise.race([apiCallPromise, timeoutPromise]) as any;
        
        const { data, error } = result;

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(`Analysis failed: ${error.message || 'Unknown error'}`);
        }

        if (!data || !data.productInfo) {
          console.error('Invalid response format:', data);
          throw new Error('Invalid response format from analysis service');
        }

        // Set scan result with the product info
        setScanResult(data.productInfo);
        setIsLoading(false);
        
        toast({
          title: "Analysis Complete",
          description: `Identified: ${data.productInfo.name || 'Unknown Food'}`,
        });
      } catch (error: any) {
        console.error('Error during scan:', error);
        setIsError(true);
        
        // If it's a timeout error, show a specific message
        if (error.message && error.message.includes('timed out')) {
          toast({
            title: "Scan Timeout",
            description: "The analysis took too long. Try with a clearer or smaller image.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Scan Error",
            description: error.message || "An unexpected error occurred. Please try again.",
            variant: "destructive"
          });
        }
        
        // For better user experience, provide fallback data after an error
        // so users can still see how the feature would work
        if (Math.random() > 0.3) { // Only show fallback data sometimes to encourage retries
          setTimeout(() => {
            setScanResult(fallbackFoodData);
            setIsLoading(false);
            toast({
              title: "Using Placeholder Data",
              description: "We're showing example data since the scan failed.",
              variant: "default"
            });
          }, 1000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    analyzeImage();
  }, [imageSrc, toast]);

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleCopyToClipboard = () => {
    if (scanResult && scanResult.name) {
      navigator.clipboard.writeText(scanResult.name)
        .then(() => {
          setIsCopied(true);
          toast({
            title: "Copied!",
            description: "Food name copied to clipboard.",
          });
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error("Could not copy text: ", err);
          toast({
            title: "Copy Failed",
            description: "Could not copy to clipboard. Please try again.",
            variant: "destructive"
          });
        });
    }
  };

  const handleSaveMeal = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to save meals.",
        variant: "destructive"
      });
      return;
    }

    if (!scanResult) {
      toast({
        title: "No scan result",
        description: "Please wait for the scan to complete before saving.",
        variant: "destructive"
      });
      return;
    }

    const mealName = customName || scanResult.name || "Unnamed Meal";
    const mealNotes = customNotes || "No notes added";

    try {
      setIsLoading(true);

      // Save the meal data to user_activity_logs table
      await logActivity(
        'meal_logged', 
        `${mealName} has been logged`,
        {
          meal_type: 'scanned',
          food_items: [mealName],
          scanned_food: {
            name: mealName,
            notes: mealNotes,
            ...scanResult
          }
        }
      );

      toast({
        title: "Meal Saved",
        description: `${mealName} has been saved to your meal log.`,
      });
      onClose();
    } catch (error) {
      console.error("Error saving meal:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save the meal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-2xl w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">Scan Result</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>Analyzing image...</span>
            </div>
          ) : isError && !scanResult ? (
            <div className="flex flex-col items-center justify-center py-8">
              <XCircle className="h-10 w-10 text-red-500 mb-2" />
              <span className="text-red-500">Failed to analyze image. Please try again.</span>
              <p className="text-sm mt-2 text-muted-foreground text-center">
                Try with a clearer image, better lighting, or a different angle. 
                Make sure the food is clearly visible.
              </p>
            </div>
          ) : scanResult ? (
            <div className="grid gap-4">
              <div className="border rounded-md overflow-hidden">
                <AspectRatio ratio={4 / 3}>
                  <img src={imageSrc} alt="Scanned Food" className="object-cover" />
                </AspectRatio>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{scanResult.name || "Unknown Food"}</CardTitle>
                    <CardDescription>
                      {scanResult.confidence ? `Confidence: ${scanResult.confidence.toFixed(2)}%` : "No confidence data"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyToClipboard}
                    disabled={isCopied}
                  >
                    {isCopied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {isCopied ? "Copied!" : "Copy Name"}
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="meal-name">Meal Name (Optional)</Label>
                  <Input
                    id="meal-name"
                    placeholder="Custom meal name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="meal-notes">Meal Notes (Optional)</Label>
                  <Textarea
                    id="meal-notes"
                    placeholder="Add any notes about this meal"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                  />
                </div>

                {scanResult.ingredients && scanResult.ingredients.length > 0 && (
                  <div className="grid gap-2">
                    <Label>Ingredients</Label>
                    <div className="flex flex-wrap gap-1">
                      {scanResult.ingredients.map((ingredient: any, index: number) => (
                        <Badge key={index} variant={ingredient.healthy ? "secondary" : "destructive"}>
                          {ingredient.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(scanResult.nutrition || scanResult.calories !== undefined) && (
                  <div className="grid gap-2">
                    <Label>Nutrition Facts (per serving)</Label>
                    <ul className="list-none pl-0">
                      <li>Calories: {scanResult.calories || scanResult.nutrition?.calories || 0}</li>
                      <li>Protein: {scanResult.protein || scanResult.nutrition?.protein || 0}g</li>
                      <li>Carbs: {scanResult.carbs || scanResult.nutrition?.carbs || 0}g</li>
                      <li>Fat: {scanResult.fat || scanResult.nutrition?.fat || 0}g</li>
                    </ul>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={onClose}>Cancel</Button>
                  <Button onClick={handleSaveMeal} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Save Meal
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <HelpCircle className="h-10 w-10 text-muted-foreground mb-2" />
              <span className="text-muted-foreground">No result to display.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanResult;
