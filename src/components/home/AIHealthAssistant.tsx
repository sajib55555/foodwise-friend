import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Mic, VolumeX, Volume, Loader2, Brain, Sparkles, AlertCircle, X, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { format, startOfDay, endOfDay, subDays } from "date-fns";

interface ScannedFood {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface MealMetadata {
  meal_type?: string;
  scanned_food?: ScannedFood;
  food_items?: any[];
}

interface WaterMetadata {
  amount?: number;
  unit?: string;
}

interface ExerciseMetadata {
  exercise_type?: string;
  duration?: number;
  calories_burned?: number;
  intensity?: string;
}

interface SleepMetadata {
  duration?: number;
  quality?: string;
  start_time?: string;
  end_time?: string;
}

interface WeightMetadata {
  weight?: number;
  unit?: string;
}

const getMetadataObject = (metadata: any): Record<string, any> => {
  if (typeof metadata === 'object' && metadata !== null) {
    return metadata;
  }
  return {};
};

const voices = [
  { id: "alloy", name: "Alloy", description: "Neutral" },
  { id: "echo", name: "Echo", description: "Balanced" },
  { id: "fable", name: "Fable", description: "British" },
  { id: "onyx", name: "Onyx", description: "Deep" },
  { id: "nova", name: "Nova", description: "Warm" },
  { id: "shimmer", name: "Shimmer", description: "Energetic" }
];

const AIHealthAssistant = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [selectedVoice, setSelectedVoice] = useState("nova");
  const [audioData, setAudioData] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          return prev < 90 ? prev + 10 : prev;
        });
        
        if (loadingProgress < 20) {
          setLoadingMessage("Collecting your health data...");
        } else if (loadingProgress < 40) {
          setLoadingMessage("Analyzing nutrition patterns...");
        } else if (loadingProgress < 60) {
          setLoadingMessage("Evaluating exercise activity...");
        } else if (loadingProgress < 80) {
          setLoadingMessage("Generating personalized insights...");
        } else {
          setLoadingMessage("Finalizing your health analysis...");
        }
      }, 800);
      
      return () => clearInterval(interval);
    }
  }, [loading, loadingProgress]);

  useEffect(() => {
    if (audioData && audioRef.current) {
      try {
        const audioSrc = `data:audio/mp3;base64,${audioData}`;
        audioRef.current.src = audioSrc;
        audioRef.current.volume = volume / 100;
        
        audioRef.current.onended = () => {
          console.log("Audio playback ended");
          setPlaying(false);
        };
        
        console.log("Audio element set up with data");
        
        playAudio();
      } catch (err) {
        console.error("Error setting up audio:", err);
        setError("Failed to set up audio playback");
      }
    }
  }, [audioData, volume]);

  const fetchNutritionData = async () => {
    try {
      const today = new Date();
      const start = startOfDay(today);
      const end = endOfDay(today);
      const weekStart = startOfDay(subDays(today, 7));
      
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('activity_type', 'meal_logged')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const processedMeals = data ? data.map(item => {
        const metadataObj = getMetadataObject(item.metadata);
        const scannedFood = getMetadataObject(metadataObj.scanned_food);
        
        return {
          date: format(new Date(item.created_at), 'yyyy-MM-dd'),
          meal_type: metadataObj.meal_type || 'snack',
          calories: scannedFood.calories || 0,
          protein: scannedFood.protein || 0,
          carbs: scannedFood.carbs || 0,
          fat: scannedFood.fat || 0,
          food_items: metadataObj.food_items || []
        };
      }) : [];
      
      const groupedByDate = processedMeals.reduce((acc, meal) => {
        if (!acc[meal.date]) {
          acc[meal.date] = [];
        }
        acc[meal.date].push(meal);
        return acc;
      }, {});
      
      const dailyTotals = Object.keys(groupedByDate).map(date => {
        const meals = groupedByDate[date];
        const totals = meals.reduce((acc, meal) => {
          return {
            calories: acc.calories + Number(meal.calories),
            protein: acc.protein + Number(meal.protein),
            carbs: acc.carbs + Number(meal.carbs),
            fat: acc.fat + Number(meal.fat)
          };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
        
        return {
          date,
          ...totals,
          meal_count: meals.length
        };
      });
      
      return {
        meals: processedMeals,
        dailyTotals
      };
      
    } catch (error) {
      console.error("Error fetching nutrition data:", error);
      return { meals: [], dailyTotals: [] };
    }
  };
  
  const fetchWaterData = async () => {
    try {
      const today = new Date();
      const weekStart = startOfDay(subDays(today, 7));
      
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('activity_type', 'water_logged')
        .gte('created_at', weekStart.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const waterData = data ? data.map(item => {
        const metadataObj = getMetadataObject(item.metadata);
        return {
          date: format(new Date(item.created_at), 'yyyy-MM-dd'),
          amount: metadataObj.amount || 0,
          unit: metadataObj.unit || 'ml'
        };
      }) : [];
      
      const dailyTotals = waterData.reduce((acc, record) => {
        if (!acc[record.date]) {
          acc[record.date] = { total: 0, count: 0 };
        }
        acc[record.date].total += Number(record.amount);
        acc[record.date].count += 1;
        return acc;
      }, {});
      
      return Object.keys(dailyTotals).map(date => ({
        date,
        total: dailyTotals[date].total,
        count: dailyTotals[date].count
      }));
      
    } catch (error) {
      console.error("Error fetching water data:", error);
      return [];
    }
  };
  
  const fetchExerciseData = async () => {
    try {
      const today = new Date();
      const weekStart = startOfDay(subDays(today, 7));
      
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('activity_type', 'exercise_logged')
        .gte('created_at', weekStart.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data ? data.map(item => {
        const metadataObj = getMetadataObject(item.metadata);
        return {
          date: format(new Date(item.created_at), 'yyyy-MM-dd'),
          type: metadataObj.exercise_type || 'other',
          duration: metadataObj.duration || 0,
          calories_burned: metadataObj.calories_burned || 0,
          intensity: metadataObj.intensity || 'medium'
        };
      }) : [];
      
    } catch (error) {
      console.error("Error fetching exercise data:", error);
      return [];
    }
  };
  
  const fetchSleepData = async () => {
    try {
      const today = new Date();
      const weekStart = startOfDay(subDays(today, 7));
      
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('activity_type', 'sleep_logged')
        .gte('created_at', weekStart.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data ? data.map(item => {
        const metadataObj = getMetadataObject(item.metadata);
        return {
          date: format(new Date(item.created_at), 'yyyy-MM-dd'),
          duration: metadataObj.duration || 0,
          quality: metadataObj.quality || 'medium',
          start_time: metadataObj.start_time,
          end_time: metadataObj.end_time
        };
      }) : [];
      
    } catch (error) {
      console.error("Error fetching sleep data:", error);
      return [];
    }
  };
  
  const fetchWeightData = async () => {
    try {
      const today = new Date();
      const monthStart = startOfDay(subDays(today, 30));
      
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('activity_type', 'weight_logged')
        .gte('created_at', monthStart.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data ? data.map(item => {
        const metadataObj = getMetadataObject(item.metadata);
        return {
          date: format(new Date(item.created_at), 'yyyy-MM-dd'),
          weight: metadataObj.weight || 0,
          unit: metadataObj.unit || 'kg'
        };
      }) : [];
      
    } catch (error) {
      console.error("Error fetching weight data:", error);
      return [];
    }
  };
  
  const fetchGoals = async () => {
    try {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data || [];
      
    } catch (error) {
      console.error("Error fetching goals:", error);
      return [];
    }
  };
  
  const fetchUserProfile = async () => {
    try {
      if (!user) return null;
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        throw profileError;
      }
      
      const { data: userProfileData, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (userProfileError && userProfileError.code !== 'PGRST116') {
        throw userProfileError;
      }
      
      return {
        ...profileData,
        healthData: userProfileData || {}
      };
      
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const handleRequestAssistant = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use the AI Health Assistant",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setLoadingProgress(10);
      setLoadingMessage("Collecting your health data...");
      setAnalysis(null);
      setError(null);
      setAudioData(null);
      
      if (isMobile) {
        setSheetOpen(true);
      } else {
        setOpen(true);
      }

      timeoutRef.current = setTimeout(() => {
        if (loading) {
          setError("The analysis is taking longer than expected. You may want to try again later.");
          setLoading(false);
          toast({
            title: "Analysis timeout",
            description: "The request is taking too long. Please try again later.",
            variant: "destructive",
          });
        }
      }, 20000);

      const [
        nutritionData,
        waterData,
        exerciseData,
        sleepData,
        weightData,
        goalsData,
        userProfile
      ] = await Promise.all([
        fetchNutritionData(),
        fetchWaterData(),
        fetchExerciseData(),
        fetchSleepData(),
        fetchWeightData(),
        fetchGoals(),
        fetchUserProfile()
      ]);
      
      setLoadingProgress(50);
      setLoadingMessage("Processing your health information...");
      
      const healthData = {
        nutrition: nutritionData,
        water: waterData,
        exercise: exerciseData,
        sleep: sleepData,
        weight: weightData,
        goals: goalsData,
        userProfile: userProfile?.healthData || {},
        voicePreference: selectedVoice
      };

      console.log("Sending health data to edge function:", JSON.stringify(healthData));
      
      setLoadingProgress(70);
      setLoadingMessage("Generating health insights...");

      const { data, error: functionError } = await supabase.functions.invoke('analyze-health-data', {
        body: { 
          healthData, 
          userName: userProfile?.full_name || user.email?.split('@')[0] || 'there'
        }
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (functionError) {
        console.error("Edge function error:", functionError);
        setError(`Failed to analyze health data: ${functionError.message}`);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("No response from server");
        setLoading(false);
        return;
      }

      console.log("Received response from edge function:", data);
      setLoadingProgress(90);
      setLoadingMessage("Processing analysis results...");

      if (data.textAnalysis) {
        setAnalysis(data.textAnalysis);
        
        if (isMobile) {
          setSheetOpen(true);
        }
      } else {
        setError("No analysis was generated");
        setLoading(false);
        return;
      }

      if (data.error) {
        console.error("API error:", data.error);
        setError(data.error);
        toast({
          title: "Voice synthesis unavailable",
          description: "Only text analysis is available due to a technical issue.",
          variant: "default",
        });
      }

      if (data.audioContent) {
        console.log("Audio content received, length:", data.audioContent.length);
        setAudioData(data.audioContent);
      } else if (!data.error) {
        toast({
          title: "Voice synthesis unavailable",
          description: "Only text analysis is available at this time.",
          variant: "default",
        });
      }
      
      setLoadingProgress(100);
    } catch (error: any) {
      console.error("Error fetching data or analyzing:", error);
      setError(error.message || "Failed to generate health insights");
      toast({
        title: "Error",
        description: error.message || "Failed to generate health insights",
        variant: "destructive",
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (!audioRef.current || !audioData) {
      console.error("Cannot play audio: Audio reference or data is missing");
      return;
    }

    try {
      console.log("Starting automatic audio playback");
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Audio playback started successfully");
            setPlaying(true);
          })
          .catch(err => {
            console.error("Automatic audio playback error:", err);
            console.log("Will require manual play due to browser restrictions");
          });
      }
    } catch (err) {
      console.error("Audio play error:", err);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioData) {
      console.error("Audio reference or data is missing");
      toast({
        title: "Playback Error",
        description: "Unable to play audio. The audio data may be missing.",
        variant: "destructive",
      });
      return;
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      try {
        console.log("Starting manual audio playback");
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully");
              setPlaying(true);
            })
            .catch(err => {
              console.error("Audio playback error:", err);
              setError("Audio playback failed. You may need to interact with the page first.");
              toast({
                title: "Playback Error",
                description: "Unable to play audio. Try clicking elsewhere on the page first.",
                variant: "destructive",
              });
            });
        }
      } catch (err) {
        console.error("Audio play error:", err);
        toast({
          title: "Playback Error",
          description: "Failed to play audio: " + err.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const resetStates = () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
    }
    setPlaying(false);
    setAnalysis(null);
    setError(null);
    setAudioData(null);
    setSheetOpen(false);
    setLoadingProgress(0);
    setLoadingMessage("");
  };

  const LoadingState = () => (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">{loadingMessage}</p>
        <span className="text-xs text-purple-600 dark:text-purple-400">{loadingProgress}%</span>
      </div>
      <Progress value={loadingProgress} className="h-2 bg-purple-100 dark:bg-purple-900/30" indicatorClassName="bg-purple-600" />
      <Alert className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40 mt-2">
        <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        <AlertTitle className="text-purple-800 dark:text-purple-300 text-sm">Analyzing Your Health Data</AlertTitle>
        <AlertDescription className="text-xs text-purple-700/80 dark:text-purple-400/80">
          We're analyzing your nutrition, exercise, water intake, and sleep patterns to provide personalized insights.
        </AlertDescription>
      </Alert>
    </div>
  );

  const VoiceSettings = () => (
    <div className="space-y-4 py-3">
      <div className="space-y-2">
        <Label htmlFor="voice-selection" className="text-purple-800 dark:text-purple-300">Voice</Label>
        <Select 
          value={selectedVoice} 
          onValueChange={setSelectedVoice}
        >
          <SelectTrigger id="voice-selection" className="border-purple-200 dark:border-purple-800/40">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {voices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                {voice.name} - {voice.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="volume-slider" className="flex justify-between text-purple-800 dark:text-purple-300">
          <span>Volume</span>
          <span>{volume}%</span>
        </Label>
        <Slider
          id="volume-slider"
          value={[volume]}
          min={0}
          max={100}
          step={5}
          onValueChange={handleVolumeChange}
          className="[&>.bg-primary]:bg-purple-500"
        />
      </div>
    </div>
  );

  const AnalysisResults = () => (
    <>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {analysis && (
        <div className="mt-4 rounded-lg bg-purple-100/50 dark:bg-purple-900/20 p-4 border border-purple-200 dark:border-purple-800/20 text-sm max-h-[50vh] overflow-y-auto">
          <p className="text-purple-800 dark:text-purple-200">{analysis}</p>
        </div>
      )}
    </>
  );

  return (
    <Card 
      variant="glass" 
      className="overflow-hidden bg-gradient-to-br from-purple-500/10 to-blue-500/5 border-purple-300/30 dark:border-purple-800/20"
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-purple-100/40 to-transparent dark:from-purple-900/20">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <motion.div 
                className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
              AI Health Assistant
            </span>
          </div>
        </CardTitle>
        
        {isMobile ? (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent 
              side="bottom" 
              className="max-h-[80vh] bg-gradient-to-b from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/20 border-purple-200 dark:border-purple-800/40"
            >
              <SheetHeader>
                <div className="flex justify-between items-center">
                  <SheetTitle className="text-gradient-purple">AI Health Insights</SheetTitle>
                  <SheetClose className="rounded-full w-6 h-6 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/30">
                    <X className="h-4 w-4" />
                  </SheetClose>
                </div>
              </SheetHeader>
              
              <div className="py-4 overflow-y-auto">
                {loading ? (
                  <LoadingState />
                ) : (
                  <AnalysisResults />
                )}
              </div>
              
              <SheetFooter className="flex items-center justify-between gap-2">
                {loading ? (
                  <Button
                    variant="outline"
                    size="sm" 
                    className="text-xs border-purple-200 dark:border-purple-800/40"
                    onClick={() => {
                      setSheetOpen(false);
                      if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                      }
                      setLoading(false);
                    }}
                  >
                    Cancel
                  </Button>
                ) : analysis ? (
                  <>
                    <Button
                      variant={playing ? "outline" : "purple-gradient"}
                      onClick={togglePlayback}
                      className="flex-1 gap-2 shadow-md text-xs"
                      size="sm"
                      disabled={!audioData}
                    >
                      {playing ? (
                        <>
                          <VolumeX className="h-3 w-3" /> Pause
                        </>
                      ) : (
                        <>
                          <Volume className="h-3 w-3" /> {audioData ? "Play" : "Text Only"}
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm" 
                      className="text-xs border-purple-200 dark:border-purple-800/40"
                      onClick={() => setSheetOpen(false)}
                    >
                      Close
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleRequestAssistant}
                    disabled={loading}
                    variant="purple-gradient"
                    className="flex-1 gap-2 shadow-md text-xs"
                    size="sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Mic className="h-3 w-3" /> Get Analysis
                      </>
                    )}
                  </Button>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (!newOpen) {
              resetStates();
            }
          }}>
            <DialogTrigger asChild>
              <Button 
                variant="purple-gradient" 
                size="sm" 
                className="shadow-md hover:shadow-lg transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" /> Get Insights
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/20 border-purple-200 dark:border-purple-800/40">
              <DialogHeader>
                <DialogTitle className="text-gradient-purple">AI Health Assistant</DialogTitle>
              </DialogHeader>

              {!loading && <VoiceSettings />}
              
              {loading ? (
                <LoadingState />
              ) : (
                <AnalysisResults />
              )}

              <DialogFooter className="flex items-center justify-between">
                {loading ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                      }
                      setLoading(false);
                      setOpen(false);
                    }}
                    className="flex-1 gap-2"
                  >
                    Cancel
                  </Button>
                ) : analysis ? (
                  <Button
                    variant={playing ? "outline" : "purple-gradient"}
                    onClick={togglePlayback}
                    className="flex-1 gap-2 shadow-md"
                    disabled={!audioData}
                  >
                    {playing ? (
                      <>
                        <VolumeX className="h-4 w-4" /> Pause
                      </>
                    ) : (
                      <>
                        <Volume className="h-4 w-4" /> {audioData ? "Play" : "Text Only"}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleRequestAssistant}
                    disabled={loading}
                    variant="purple-gradient"
                    className="flex-1 gap-2 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" /> Get Voice Analysis
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {isMobile && (
          <Button 
            variant="purple-gradient" 
            size="sm" 
            className="shadow-md hover:shadow-lg transition-all"
            onClick={() => {
              if (loading) {
                setSheetOpen(true);
              } else if (analysis) {
                setSheetOpen(true);
              } else {
                handleRequestAssistant();
              }
            }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" /> Analyzing...
              </>
            ) : analysis ? (
              <>
                <Sparkles className="h-4 w-4 mr-1" /> View Insights
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" /> Get Insights
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center p-2 md:p-3 text-center"
        >
          <div className="relative">
            <motion.div 
              className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <Brain className="h-12 w-12 text-purple-600/80 dark:text-purple-400/80 relative z-10" />
          </div>
          <p className="text-muted-foreground text-xs md:text-sm mt-3 max-w-md">
            Get personalized health insights and recommendations with our AI voice assistant
          </p>
          <Alert className="mt-3 bg-blue-50/50 border border-blue-200/50 dark:bg-blue-900/10 dark:border-blue-800/20">
            <Info className="h-3 w-3 text-blue-500" />
            <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
              Analysis uses your nutrition, exercise, and sleep data to provide personalized insights.
            </AlertDescription>
          </Alert>
          <Button
            variant="purple-gradient"
            size="sm"
            className="mt-3 shadow-sm hover:shadow hover:translate-y-[-2px] transition-all duration-200"
            onClick={() => {
              if (isMobile) {
                if (loading) {
                  setSheetOpen(true);
                } else if (analysis) {
                  setSheetOpen(true);
                } else {
                  handleRequestAssistant();
                }
              } else {
                setOpen(true);
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1 text-white" />
                {analysis ? "View health insights" : "Ask for health advice"}
              </>
            )}
          </Button>
        </motion.div>
      </CardContent>
      
      <audio 
        ref={audioRef} 
        style={{ display: 'none' }} 
        onError={(e) => {
          console.error("Audio error:", e);
          setError("Audio playback error: The audio file might be corrupted or in an unsupported format.");
        }}
        onEnded={() => {
          console.log("Audio playback ended (from onEnded)");
          setPlaying(false);
        }}
      />
    </Card>
  );
};

export default AIHealthAssistant;
