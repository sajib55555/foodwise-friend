
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { PlusCircle, UtensilsCrossed, Salad, Scale, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

const ActionButtons = () => {
  const navigate = useNavigate();

  const actions = [
    { 
      icon: <PlusCircle className="h-5 w-5" />, 
      label: "Log Meal", 
      onClick: () => navigate("/log-meal"),
      color: "bg-gradient-to-br from-purple-400 to-purple-600"
    },
    { 
      icon: <UtensilsCrossed className="h-5 w-5" />, 
      label: "Food Scanner", 
      onClick: () => navigate("/scan"),
      color: "bg-gradient-to-br from-blue-400 to-blue-600"
    },
    { 
      icon: <Salad className="h-5 w-5" />, 
      label: "Meal Plans", 
      onClick: () => navigate("/plans"),
      color: "bg-gradient-to-br from-green-400 to-green-600"
    },
    { 
      icon: <Scale className="h-5 w-5" />, 
      label: "Weight", 
      onClick: () => navigate("/weight"),
      color: "bg-gradient-to-br from-amber-400 to-amber-600"
    }
  ];

  return (
    <Card variant="glass">
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-2">
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
                className={`w-14 h-14 rounded-full mb-1 text-white ${action.color}`}
                onClick={action.onClick}
              >
                {action.icon}
              </Button>
              <span className="text-xs text-center">{action.label}</span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionButtons;
