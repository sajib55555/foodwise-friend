
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Moon, Clock, BedDouble } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SleepTracker = () => {
  const { toast } = useToast();
  const [hours, setHours] = useState(7.5);
  const [quality, setQuality] = useState(3);
  const [showInput, setShowInput] = useState(false);

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

  const handleSleepLog = () => {
    // Save sleep data (could be expanded to use Supabase)
    const sleepData = { date: new Date().toISOString(), hours, quality };
    
    // In a real app, we would save this to the database
    console.log("Sleep data logged:", sleepData);
    
    toast({
      title: "Sleep Logged",
      description: `${hours} hours with ${getSleepQualityText(quality)} quality`,
    });
    
    setShowInput(false);
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
            variant="ghost" 
            onClick={() => setShowInput(true)}
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
              >
                Cancel
              </Button>
              <Button 
                className="w-full" 
                onClick={handleSleepLog}
              >
                Save
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
                <div className="text-2xl font-bold">7.5h</div>
                <div className="text-xs text-muted-foreground">Avg Duration</div>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <div className="flex justify-center mb-1">
                  <BedDouble className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold">Good</div>
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
