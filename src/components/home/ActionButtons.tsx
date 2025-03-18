
import React from "react";
import { Button } from "@/components/ui/button-custom";
import { Camera, BarChart3, FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ActionButtons: React.FC = () => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4"
    >
      <motion.div variants={item}>
        <Button 
          onClick={() => navigate('/scan')}
          variant="glass"
          className="w-full h-auto flex flex-col items-center justify-center p-4 space-y-2"
          hover="lift"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium">Scan Food</p>
            <p className="text-xs text-muted-foreground">Label or photo</p>
          </div>
        </Button>
      </motion.div>

      <motion.div variants={item}>
        <Button
          onClick={() => navigate('/nutrition')}
          variant="glass"
          className="w-full h-auto flex flex-col items-center justify-center p-4 space-y-2"
          hover="lift"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-center">
            <p className="font-medium">Nutrition</p>
            <p className="text-xs text-muted-foreground">View insights</p>
          </div>
        </Button>
      </motion.div>

      <motion.div variants={item}>
        <Button
          onClick={() => navigate('/plans')}
          variant="glass"
          className="w-full h-auto flex flex-col items-center justify-center p-4 space-y-2"
          hover="lift"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <div className="text-center">
            <p className="font-medium">Meal Plans</p>
            <p className="text-xs text-muted-foreground">Personalized diets</p>
          </div>
        </Button>
      </motion.div>

      <motion.div variants={item}>
        <Button
          onClick={() => navigate('/log-meal')}
          variant="glass"
          className="w-full h-auto flex flex-col items-center justify-center p-4 space-y-2"
          hover="lift"
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Plus className="h-6 w-6 text-amber-500" />
          </div>
          <div className="text-center">
            <p className="font-medium">Log Meal</p>
            <p className="text-xs text-muted-foreground">Manual entry</p>
          </div>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ActionButtons;
