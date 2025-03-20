
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { 
  PlusCircle, 
  UtensilsCrossed, 
  Salad, 
  Scale, 
  Dumbbell, 
  Target,
  Brain,
  Droplets,
  Moon
} from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const ActionButtons = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Button sizing - increased by 20%
  const buttonSize = isMobile ? 'w-12 h-12' : 'w-[19.2px] h-[19.2px]';
  const iconSize = isMobile ? 'h-5 w-5' : 'h-6 w-6';

  const actions = [
    { 
      icon: <PlusCircle className={iconSize} />, 
      label: "Log Meal", 
      onClick: () => navigate("/log-meal"),
      gradient: "bg-gradient-to-br from-purple-400 to-purple-600",
      textColor: "text-white",
      shadow: "shadow-purple"
    },
    { 
      icon: <UtensilsCrossed className={iconSize} />, 
      label: "Food Scanner", 
      onClick: () => navigate("/scan"),
      gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
      textColor: "text-white",
      shadow: "shadow-blue"
    },
    { 
      icon: <Salad className={iconSize} />, 
      label: "Meal Plans", 
      onClick: () => navigate("/plans"),
      gradient: "bg-gradient-to-br from-green-400 to-green-600",
      textColor: "text-white",
      shadow: "shadow-green"
    },
    { 
      icon: <Brain className={iconSize} />, 
      label: "AI Assistant", 
      onClick: () => document.getElementById('ai-health-assistant')?.scrollIntoView({ behavior: 'smooth' }),
      gradient: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      textColor: "text-white",
      shadow: "shadow-indigo"
    },
    { 
      icon: <Droplets className={iconSize} />, 
      label: "Water Intake", 
      onClick: () => document.getElementById('water-tracker')?.scrollIntoView({ behavior: 'smooth' }),
      gradient: "bg-gradient-to-br from-cyan-400 to-cyan-600",
      textColor: "text-white",
      shadow: "shadow-cyan"
    },
    { 
      icon: <Moon className={iconSize} />, 
      label: "Sleep Tracker", 
      onClick: () => document.getElementById('sleep-tracker')?.scrollIntoView({ behavior: 'smooth' }),
      gradient: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      textColor: "text-white",
      shadow: "shadow-indigo"
    },
    { 
      icon: <Scale className={iconSize} />, 
      label: "Weight", 
      onClick: () => navigate("/weight"),
      gradient: "bg-gradient-to-br from-amber-400 to-amber-600",
      textColor: "text-white",
      shadow: "shadow-amber"
    },
    { 
      icon: <Dumbbell className={iconSize} />, 
      label: "Workouts", 
      onClick: () => navigate("/workout"),
      gradient: "bg-gradient-to-br from-pink-400 to-pink-600",
      textColor: "text-white",
      shadow: "shadow-pink"
    },
    { 
      icon: <Target className={iconSize} />, 
      label: "Goals", 
      onClick: () => navigate("/goals"),
      gradient: "bg-gradient-to-br from-teal-400 to-teal-600",
      textColor: "text-white",
      shadow: "shadow-teal"
    }
  ];

  return (
    <Card variant="glass" className="border border-purple-200/30 dark:border-purple-800/20">
      <CardContent className="p-2 md:p-6">
        <div className={`grid ${isMobile ? 'grid-cols-3 gap-2' : 'grid-cols-3 gap-3'} md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3`}>
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <Button 
                variant="ghost"
                size="icon"
                className={`${isMobile ? 'w-12 h-12' : 'w-20 h-20'} rounded-full mb-1 md:mb-2 ${action.textColor} ${action.gradient} ${action.shadow} hover:scale-105 transition-transform`}
                onClick={action.onClick}
              >
                {action.icon}
              </Button>
              <span className="text-[9px] md:text-xs font-medium text-center">{action.label}</span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionButtons;
