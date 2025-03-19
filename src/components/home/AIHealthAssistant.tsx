
import React, { useState, useRef } from "react";
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
import { Mic, VolumeX, Volume, Loader2, Brain, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [selectedVoice, setSelectedVoice] = useState("nova");
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      setAnalysis(null);

      // Create a mock dataset since we don't have the actual tables in our database schema
      const mockHealthData = {
        nutrition: [
          { calories: 2100, protein: 120, carbs: 200, fat: 70 }
        ],
        exercise: [
          { type: "cardio", duration: 30, calories_burned: 300 },
          { type: "strength", duration: 45, calories_burned: 250 }
        ],
        water: [
          { amount: 2000, unit: "ml" }
        ],
        sleep: [
          { duration: 7.5, quality: "good" }
        ],
        goals: []
      };

      // Fetch user goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (goalsError) {
        console.error("Error fetching goals:", goalsError);
      } else {
        mockHealthData.goals = goalsData || [];
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }

      // Call the Edge Function to analyze the data and generate voice response
      const healthData = {
        nutrition: mockHealthData.nutrition,
        exercise: mockHealthData.exercise,
        water: mockHealthData.water,
        sleep: mockHealthData.sleep,
        goals: mockHealthData.goals,
        voicePreference: selectedVoice
      };

      console.log("Sending health data to edge function:", JSON.stringify(healthData));
      
      const { data, error } = await supabase.functions.invoke('analyze-health-data', {
        body: { 
          healthData, 
          userName: profileData?.full_name || user.email?.split('@')[0] || 'there'
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || 'Failed to analyze health data');
      }

      console.log("Received response from edge function:", data);

      // Handle the response
      if (data.audioContent && data.textAnalysis) {
        setAnalysis(data.textAnalysis);
        
        // Convert base64 to audio
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        
        // Play the audio with the current volume setting
        if (audioRef.current) {
          audioRef.current.src = audioSrc;
          audioRef.current.volume = volume / 100;
          audioRef.current.play();
          setPlaying(true);
          
          audioRef.current.onended = () => {
            setPlaying(false);
          };
        }
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error("Error fetching data or analyzing:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate health insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play();
        setPlaying(true);
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="purple-gradient" size="sm" className="shadow-md hover:shadow-lg transition-all">
              <Sparkles className="h-4 w-4 mr-1" /> Get Insights
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/20 border-purple-200 dark:border-purple-800/40">
            <DialogHeader>
              <DialogTitle className="text-gradient-purple">AI Health Assistant</DialogTitle>
            </DialogHeader>

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

              {analysis && (
                <div className="mt-4 rounded-lg bg-purple-100/50 dark:bg-purple-900/20 p-4 border border-purple-200 dark:border-purple-800/20 text-sm">
                  <p className="text-purple-800 dark:text-purple-200">{analysis}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex items-center justify-between">
              {analysis ? (
                <Button
                  variant={playing ? "outline" : "purple-gradient"}
                  onClick={togglePlayback}
                  className="flex-1 gap-2 shadow-md"
                >
                  {playing ? (
                    <>
                      <VolumeX className="h-4 w-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Volume className="h-4 w-4" /> Play Again
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
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center p-4 text-center"
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
            <Brain className="h-16 w-16 text-purple-600/80 dark:text-purple-400/80 relative z-10" />
          </div>
          <p className="text-muted-foreground text-sm mt-4 max-w-md">
            Get personalized health insights and recommendations with our AI voice assistant
          </p>
          <Button
            variant="purple-outline"
            size="sm"
            className="mt-4 shadow-sm hover:shadow hover:translate-y-[-2px] transition-all duration-200"
            onClick={() => setOpen(true)}
          >
            <Sparkles className="h-4 w-4 mr-1 text-purple-500" />
            Ask for health advice
          </Button>
        </motion.div>
      </CardContent>
      
      {/* Hidden audio element for playing the TTS response */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </Card>
  );
};

export default AIHealthAssistant;
