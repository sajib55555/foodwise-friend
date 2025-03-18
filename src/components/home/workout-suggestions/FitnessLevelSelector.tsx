
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button-custom";
import { ArrowRight } from "lucide-react";
import { FitnessLevel } from "./types";

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
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-4 mb-4">
        {fitnessLevels.map(level => (
          <TabsTrigger 
            key={level.id} 
            value={level.id}
            disabled={loading}
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
