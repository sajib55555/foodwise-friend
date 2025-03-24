
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Moon, Clock, BedDouble } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

// Define TypeScript interfaces for our data structures
interface SleepMetadata {
  hours: number;
  quality: number;
  quality_text?: string;
  date?: string;
  time?: string;
}

interface SleepLogEntry {
  id: string;
  created_at: string;
  metadata: Json;
  user_id: string;
  activity_type: string;
  description: string;
}

const SleepTracker = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [hours, setHours] = useState(7.5);
  const [quality, setQuality] = useState(3);
  const [showInput, setShowInput] = useState(false);
  const [averageDuration, setAverageDuration] = useState<number | null>(null);
  const [averageQuality, setAverageQuality] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSleepData();
    }
  }, [user]);

  const fetchSleepData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_type', 'sleep_logged')
        .order('created_at', { ascending: false })
        .limit(7);
        
      if (error) {
        console.error('Error fetching sleep data:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Calculate average duration
        let totalDuration = 0;
        let totalQualityScore = 0;
        
        data.forEach(item => {
          // Safely extract metadata
          if (item.metadata && typeof item.metadata === 'object') {
            // First try to access as an object with known properties
            const metadata = item.metadata as Record<string, Json>;
            
            // Check if hours and quality exist and are numbers
            if (metadata.hours !== undefined && typeof metadata.hours === 'number' &&
                metadata.quality !== undefined && typeof metadata.quality === 'number') {
              totalDuration += metadata.hours;
              totalQualityScore += metadata.quality;
            } else {
              console.warn('Invalid sleep metadata structure:', metadata);
            }
          } else {
            console.warn('Invalid metadata format:', item.metadata);
          }
        });
        
        if (data.length > 0) {
          const avgDuration = totalDuration / data.length;
          const avgQuality = totalQualityScore / data.length;
          
          setAverageDuration(parseFloat(avgDuration.toFixed(1)));
          setAverageQuality(getSleepQualityText(Math.round(avgQuality)));
        }
      } else {
        // Set defaults if no data
        setAverageDuration(7.5);
        setAverageQuality('Good');
      }
    } catch (err) {
      console.error('Failed to fetch sleep data:', err);
    }
  };

  const getSleepQualityText = (quality: number) => {
    switch (quality) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Good";
    }
  };

  const getSleepQualityColor = (quality: number) => {
    switch (quality) {
      case 1: return "bg-red-500";
      case 2: return "bg-orange-500";
      case 3: return "bg-blue-500";
      case 4: return "bg-green-500";
      case 5: return "bg-purple-500";
      default: return "bg-blue-500";
    }
  };

  const handleSleepLog = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to track your sleep",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const now = new Date();
      // Create the sleep data object
      const sleepData: SleepMetadata = { 
        hours, 
        quality,
        quality_text: getSleepQualityText(quality),
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].slice(0, 5)
      };
      
      // Convert SleepMetadata to Json type by casting it as unknown first, then as Json
      // This satisfies TypeScript's type checking while ensuring the structure is compatible
      const { error } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user.id,
          activity_type: 'sleep_logged',
          description: `Logged ${hours} hours of sleep with ${getSleepQualityText(quality)} quality`,
          metadata: sleepData as unknown as Json
        });
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Sleep Logged",
        description: `${hours} hours with ${getSleepQualityText(quality)} quality`,
      });
      
      fetchSleepData();
      setShowInput(false);
    } catch (err) {
      console.error('Error saving sleep data:', err);
      toast({
        title: "Error",
        description: "Failed to save sleep data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-blue-400" />
            Sleep Tracker
          </div>
        </CardTitle>
        {!showInput && (
          <Button 
            size="sm" 
            onClick={() => setShowInput(true)}
            variant="purple-gradient"
          >
            Log Sleep
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showInput ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Hours Slept
                </label>
                <span className="text-2xl font-semibold">{hours}</span>
              </div>
              <Slider
                value={[hours]}
                min={0}
                max={12}
                step={0.5}
                onValueChange={(value) => setHours(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0h</span>
                <span>6h</span>
                <span>12h</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium flex items-center gap-1">
                  <BedDouble className="h-4 w-4" /> Sleep Quality
                </label>
                <Badge className={getSleepQualityColor(quality)}>
                  {getSleepQualityText(quality)}
                </Badge>
              </div>
              <Slider
                value={[quality]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => setQuality(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Poor</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setShowInput(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                className="w-full" 
                onClick={handleSleepLog}
                disabled={isLoading}
                variant="purple-gradient"
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <div className="flex justify-center mb-1">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold">{averageDuration || '7.5'}h</div>
                <div className="text-xs text-muted-foreground">Avg Duration</div>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <div className="flex justify-center mb-1">
                  <BedDouble className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold">{averageQuality || 'Good'}</div>
                <div className="text-xs text-muted-foreground">Avg Quality</div>
              </div>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              Track your sleep for better health insights
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SleepTracker;
