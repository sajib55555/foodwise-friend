
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Plus, Minus, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

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
  const [waterAmount, setWaterAmount] = useState(initialAmount);
  const glassSize = 250; // ml per glass

  const addWater = () => {
    const newAmount = waterAmount + glassSize;
    setWaterAmount(newAmount);
    if (onUpdate) onUpdate(newAmount);
  };

  const removeWater = () => {
    const newAmount = Math.max(0, waterAmount - glassSize);
    setWaterAmount(newAmount);
    if (onUpdate) onUpdate(newAmount);
  };

  const percentageFilled = Math.min(100, (waterAmount / dailyGoal) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Water Intake
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full h-32 bg-blue-100/30 rounded-xl overflow-hidden">
              <div 
                className="absolute bottom-0 w-full bg-blue-500/60 transition-all duration-500 ease-out"
                style={{ height: `${percentageFilled}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-semibold text-blue-700">{waterAmount}ml</span>
                <span className="text-sm text-blue-600">{percentageFilled.toFixed(0)}% of goal</span>
              </div>
            </div>
            
            <div className="flex justify-between w-full">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={removeWater}
                disabled={waterAmount <= 0}
              >
                <Minus className="h-4 w-4" />
                Remove Glass
              </Button>
              
              <Button 
                variant="purple" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={addWater}
              >
                <Plus className="h-4 w-4" />
                Add Glass
              </Button>
            </div>
            
            <div className="w-full">
              <Progress value={percentageFilled} className="h-2 bg-blue-100" />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>0ml</span>
                <span>{dailyGoal/2}ml</span>
                <span>{dailyGoal}ml</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WaterTracker;
