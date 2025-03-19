
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Plus, Minus, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface WaterTrackerProps {
  initialAmount?: number;
  dailyGoal?: number;
  onUpdate?: (amount: number) => void;
}

const WaterTracker: React.FC<WaterTrackerProps> = ({
  initialAmount = 0,
  dailyGoal = 2000, // 2 liters in ml
  onUpdate,
}) => {
  const { toast } = useToast();
  const [waterAmount, setWaterAmount] = useState(initialAmount);
  const glassSize = 250; // ml per glass

  // Load water amount from localStorage on component mount
  useEffect(() => {
    const savedAmount = localStorage.getItem('waterAmount');
    if (savedAmount) {
      setWaterAmount(parseInt(savedAmount));
    }
  }, []);

  // Save water amount to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('waterAmount', waterAmount.toString());
  }, [waterAmount]);

  // Reset water amount at midnight
  useEffect(() => {
    const checkForNewDay = () => {
      const lastTrackedDay = localStorage.getItem('lastWaterTrackedDay');
      const today = new Date().toDateString();
      
      if (lastTrackedDay && lastTrackedDay !== today) {
        setWaterAmount(0);
      }
      
      localStorage.setItem('lastWaterTrackedDay', today);
    };
    
    checkForNewDay();
    
    // Set up interval to check for day change (every hour)
    const interval = setInterval(checkForNewDay, 3600000);
    return () => clearInterval(interval);
  }, []);

  const addWater = () => {
    const newAmount = waterAmount + glassSize;
    setWaterAmount(newAmount);
    if (onUpdate) onUpdate(newAmount);
    
    toast({
      title: "Water added",
      description: `Added ${glassSize}ml of water. Total: ${newAmount}ml`,
    });
  };

  const removeWater = () => {
    const newAmount = Math.max(0, waterAmount - glassSize);
    setWaterAmount(newAmount);
    if (onUpdate) onUpdate(newAmount);
    
    if (waterAmount > 0) {
      toast({
        title: "Water removed",
        description: `Removed ${glassSize}ml of water. Total: ${newAmount}ml`,
      });
    }
  };

  const percentageFilled = Math.min(100, (waterAmount / dailyGoal) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden"
    >
      <Card variant="glass" className="border border-blue-300/40 dark:border-blue-800/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-cyan-50/20 dark:from-blue-900/10 dark:to-cyan-900/5 z-0"></div>
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-cyan-400/20 rounded-full blur-xl"></div>
        
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 font-bold">
              Water Intake
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full h-36 bg-gradient-to-b from-blue-100/50 to-blue-50/30 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl overflow-hidden shadow-inner border border-blue-200/50 dark:border-blue-800/30">
              {/* Water wave animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500/80 to-blue-400/60 transition-all duration-500 ease-out"
                  style={{ height: `${percentageFilled}%` }}
                >
                  <div className="absolute inset-0 opacity-30">
                    <div className="h-1.5 w-[200%] absolute top-0 left-0 bg-blue-300/70 rounded-full transform -translate-x-1/2 animate-[move_8s_linear_infinite]"></div>
                    <div className="h-1.5 w-[200%] absolute top-[10%] left-0 bg-blue-300/70 rounded-full transform -translate-x-1/4 animate-[move_10s_linear_infinite]"></div>
                    <div className="h-1.5 w-[200%] absolute top-[20%] left-0 bg-blue-300/70 rounded-full transform -translate-x-3/4 animate-[move_12s_linear_infinite]"></div>
                  </div>
                </div>
              </div>
              
              {/* Content overlay */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-blue-800 to-blue-600 dark:from-blue-300 dark:to-blue-400">
                  {waterAmount}ml
                </span>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300 bg-white/40 dark:bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {percentageFilled.toFixed(0)}% of goal
                </span>
              </div>
            </div>
            
            <div className="flex justify-between w-full">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 border-blue-300 bg-white/70 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-all shadow-sm"
                onClick={removeWater}
                disabled={waterAmount <= 0}
              >
                <Minus className="h-4 w-4" />
                Remove Glass
              </Button>
              
              <Button 
                variant="blue-gradient" 
                size="sm" 
                className="flex items-center gap-1 shadow-blue hover:shadow-blue-lg transition-all"
                onClick={addWater}
              >
                <Plus className="h-4 w-4" />
                Add Glass
              </Button>
            </div>
            
            <div className="w-full">
              <Progress 
                value={percentageFilled} 
                className="h-2 bg-blue-100/50 dark:bg-blue-900/30" 
                indicatorClassName="bg-gradient-to-r from-blue-500 to-cyan-500"
              />
              
              <div className="flex justify-between mt-1 text-xs">
                <span className="text-blue-600 dark:text-blue-400">0ml</span>
                <span className="text-blue-600 dark:text-blue-400">{dailyGoal/2}ml</span>
                <span className="text-blue-600 dark:text-blue-400">{dailyGoal}ml</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WaterTracker;
