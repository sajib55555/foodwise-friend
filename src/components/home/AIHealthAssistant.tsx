
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
import { Mic, VolumeX, Volume, Loader2, Brain } from "lucide-react";
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
      // In a production app, you would fetch real data from your database
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
        goals: await supabase
          .from("user_goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      };

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Call the Edge Function to analyze the data and generate voice response
      const healthData = {
        nutrition: mockHealthData.nutrition || [],
        exercise: mockHealthData.exercise || [],
        water: mockHealthData.water || [],
        sleep: mockHealthData.sleep || [],
        goals: mockHealthData.goals?.data || [],
        voicePreference: selectedVoice
      };

      const { data, error } = await supabase.functions.invoke('analyze-health-data', {
        body: { 
          healthData, 
          userName: profileData?.full_name || user.email?.split('@')[0] || 'there'
        }
      });

      if (error) {
        throw error;
      }

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
    <Card variant="glass">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Health Assistant
          </div>
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="purple" size="sm">
              Get Insights
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>AI Health Assistant</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="voice-selection">Voice</Label>
                <Select 
                  value={selectedVoice} 
                  onValueChange={setSelectedVoice}
                >
                  <SelectTrigger id="voice-selection">
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
                <Label htmlFor="volume-slider" className="flex justify-between">
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
                />
              </div>

              {analysis && (
                <div className="mt-4 rounded-lg bg-secondary/20 p-3 text-sm">
                  <p className="text-muted-foreground">{analysis}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex items-center justify-between">
              {analysis ? (
                <Button
                  variant={playing ? "outline" : "default"}
                  onClick={togglePlayback}
                  className="flex-1 gap-2"
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
                  className="flex-1 gap-2"
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
          className="flex flex-col items-center p-2 text-center"
        >
          <Brain className="h-12 w-12 text-purple-500/50 mb-3" />
          <p className="text-muted-foreground text-sm">
            Get personalized health insights and recommendations with our AI voice assistant
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setOpen(true)}
          >
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
