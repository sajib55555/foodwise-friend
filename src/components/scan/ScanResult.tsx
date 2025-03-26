
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ScanResultProps {
  imageSrc: string;
  onClose: () => void;
}

// Reliable fallback data with visual indicator showing it's a fallback
const fallbackFoodData = {
  name: "Analysis Unavailable",
  calories: 250,
  protein: 10,
  carbs: 30,
  fat: 8,
  healthScore: 5,
  ingredients: [
    { name: "Could not identify ingredients", healthy: false }
  ],
  warnings: ["Service temporarily unavailable"],
  recommendations: ["Try with a smaller or clearer image", "Try again in a few moments"],
  servingSize: "Estimated portion",
  dietary: {
    vegan: false,
    vegetarian: false,
    glutenFree: false,
    dairyFree: false
  }
};

const ScanResult: React.FC<ScanResultProps> = ({ imageSrc, onClose }) => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [isUsingMobileDialog, setIsUsingMobileDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { logActivity } = useActivityLog();
  const [processingAttempts, setProcessingAttempts] = useState(0);
  const maxAttempts = 2;

  // Function to drastically compress the image to reduce its size
  const aggressivelyCompressImage = async (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Target size: much lower resolution for API processing
        const maxWidth = 600;
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
        
        // Convert to JPEG format with very reduced quality (0.5 = 50% quality)
        // This is much more aggressive than before to ensure faster processing
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
        resolve(compressedBase64);
      };
      
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      
      // Handle the input image which could be a base64 string or URL
      img.src = base64Image;
    });
  };

  // Detect if we should use Dialog (desktop) or Sheet (mobile)
  useEffect(() => {
    const checkMobile = () => {
      setIsUsingMobileDialog(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // This function ensures all required fields exist in the result
  const ensureCompleteData = (data: any) => {
    // Start with fallback data structure
    const complete = { ...fallbackFoodData };
    
    // Override with actual data if present
    if (data) {
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          complete[key] = data[key];
        }
      });
      
      // Ensure name is always available
      if (!complete.name || complete.name === "Unknown Food") {
        complete.name = customName || "Unnamed Food";
      }
    }
    
    return complete;
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

        console.log("Compressing image more aggressively...");
        const compressedImage = await aggressivelyCompressImage(base64Image);
        console.log(`Image compressed: Original length=${base64Image.length}, Compressed length=${compressedImage.length}`);
        
        // Show compression feedback to user
        toast({
          title: "Processing Image",
          description: "Optimizing image for faster analysis...",
        });
        
        // Set a reasonable timeout for the API call
        const timeoutDuration = 15000; // 15 seconds
        
        // Create a promise that rejects after timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Analysis request timed out')), timeoutDuration);
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
          // If Supabase function returned no data, try with fallback
          if (data?.error) {
            console.error('Analysis error from server:', data.error);
            throw new Error(data.error);
          }
          console.error('Invalid response format:', data);
          throw new Error('Invalid response format from analysis service');
        }

        // Set scan result with the product info
        const completeData = ensureCompleteData(data.productInfo);
        setScanResult(completeData);
        setIsLoading(false);
        setProcessingAttempts(0); // Reset attempts on success
        
        toast({
          title: "Analysis Complete",
          description: `Identified: ${completeData.name || 'Unknown Food'}`,
        });
      } catch (error: any) {
        console.error('Error during scan:', error);
        
        const newAttemptCount = processingAttempts + 1;
        setProcessingAttempts(newAttemptCount);
        
        // If we haven't exceeded max attempts, try one more time with even more compression
        if (newAttemptCount <= maxAttempts) {
          toast({
            title: "Retrying Analysis",
            description: `Optimizing further and trying again (${newAttemptCount}/${maxAttempts})...`,
          });
          
          // Wait a moment before retrying
          setTimeout(() => {
            analyzeImage();
          }, 1000);
          return;
        }
        
        setIsError(true);
        
        // If it's a timeout error, show a specific message
        if (error.message && error.message.includes('timed out')) {
          toast({
            title: "Analysis Timeout",
            description: "The analysis took too long. Please try with a clearer or smaller image.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Analysis Failed",
            description: error.message || "An unexpected error occurred. Please try again.",
            variant: "destructive"
          });
        }
        
        // Always provide fallback data after an error for better UX
        setScanResult(fallbackFoodData);
        setIsLoading(false);
        
        toast({
          title: "Using Placeholder Data",
          description: "We're showing example data since the analysis couldn't complete.",
        });
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

  const renderContent = () => (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">Scan Result</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <XCircle className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            <span className="mt-2 text-sm text-muted-foreground">Analyzing image...</span>
            <span className="mt-1 text-xs text-muted-foreground">This may take up to 15 seconds</span>
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
                    {scanResult.confidence ? `Confidence: ${scanResult.confidence.toFixed(2)}%` : 
                     isError ? "Using fallback data" : "Serving size: " + scanResult.servingSize}
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

              {/* Health score display with color gradient */}
              {scanResult.healthScore !== undefined && (
                <div className="grid gap-2">
                  <Label>Health Score</Label>
                  <div className="relative h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full ${
                        scanResult.healthScore >= 7 ? 'bg-green-500' : 
                        scanResult.healthScore >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(scanResult.healthScore / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {scanResult.healthScore}/10
                  </div>
                </div>
              )}
 
              {/* Warnings and recommendations */}
              {scanResult.warnings && scanResult.warnings.length > 0 && (
                <div className="grid gap-2">
                  <Label>Dietary Considerations</Label>
                  <ul className="list-disc pl-5 text-sm">
                    {scanResult.warnings.map((warning: string, index: number) => (
                      <li key={index} className="text-amber-600 dark:text-amber-400">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {scanResult.recommendations && scanResult.recommendations.length > 0 && (
                <div className="grid gap-2">
                  <Label>Recommendations</Label>
                  <ul className="list-disc pl-5 text-sm">
                    {scanResult.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-green-600 dark:text-green-400">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
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
    </>
  );

  // Use Dialog on desktop and Sheet on mobile
  return isUsingMobileDialog ? (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[90%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Scan Result</SheetTitle>
          <SheetDescription>
            {isError ? "Results may be limited due to processing issues" : "Analysis results for your food"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scan Result</DialogTitle>
          <DialogDescription>
            {isError ? "Results may be limited due to processing issues" : "Analysis results for your food"}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScanResult;
