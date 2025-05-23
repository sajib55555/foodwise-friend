
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button-custom";
import { ArrowRight } from "lucide-react";
import { FitnessLevel, FitnessLevelInfo } from "./types";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface FitnessLevelSelectorProps {
  fitnessLevels: FitnessLevelInfo[];
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
  const isMobile = useIsMobile();
  
  // Map of fitness levels to color classes - using purple for consistency
  const tabColors = {
    beginner: "data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300",
    intermediate: "data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300",
    advanced: "data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300",
    expert: "data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300",
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      {/* Use a responsive grid with larger gap and fixed height for tabs */}
      <TabsList className="grid grid-cols-2 mb-4 gap-2 md:grid-cols-4 h-auto">
        {fitnessLevels.map(level => (
          <TabsTrigger 
            key={level.id} 
            value={level.id}
            disabled={loading}
            className={cn(
              "transition-all text-sm whitespace-normal h-full px-2 py-2 flex items-center justify-center",
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
            size={isMobile ? "sm" : "default"}
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
