
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button-custom";
import { ArrowRight } from "lucide-react";
import { FitnessLevel } from "./types";
import { cn } from "@/lib/utils";

interface FitnessLevelSelectorProps {
  fitnessLevels: FitnessLevel[];
  activeTab: string;
  loading: boolean;
  onTabChange: (value: string) => void;
  onFetchSuggestions: (fitnessLevel: string) => void;
}

export const FitnessLevelSelector: React.FC<FitnessLevelSelectorProps> = ({
  fitnessLevels,
  activeTab,
  loading,
  onTabChange,
  onFetchSuggestions,
}) => {
  // Map of fitness levels to color classes
  const tabColors = {
    beginner: "data-[state=active]:bg-green-100 data-[state=active]:text-green-700 dark:data-[state=active]:bg-green-900/30 dark:data-[state=active]:text-green-300",
    intermediate: "data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300",
    advanced: "data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300",
    expert: "data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-pink-900/30 dark:data-[state=active]:text-pink-300",
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-4 mb-4">
        {fitnessLevels.map(level => (
          <TabsTrigger 
            key={level.id} 
            value={level.id}
            disabled={loading}
            className={cn(
              "transition-all",
              tabColors[level.id as keyof typeof tabColors]
            )}
          >
            {level.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {fitnessLevels.map(level => (
        <TabsContent key={level.id} value={level.id} className="space-y-4">
          <p className="text-sm text-muted-foreground">{level.description}</p>
          
          <Button 
            variant="purple-gradient"
            className="w-full"
            onClick={() => onFetchSuggestions(level.label)}
            disabled={loading}
          >
            {loading ? "Generating..." : "Get Workout Suggestions"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </TabsContent>
      ))}
    </Tabs>
  );
};
