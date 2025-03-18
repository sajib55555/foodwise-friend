
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Dumbbell, ArrowRight, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Exercise {
  name: string;
  reps?: string;
  sets?: string;
  duration?: string;
}

interface Workout {
  name: string;
  description: string;
  exercises: string[] | Exercise[];
  caloriesBurned: number;
  difficulty: string;
  duration: string;
}

interface WorkoutSuggestionsResponse {
  workouts: Workout[];
}

const WorkoutSuggestions: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Workout[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentFitnessLevel, setCurrentFitnessLevel] = useState("Beginner");
  
  const fitnessLevels = [
    { id: "beginner", label: "Beginner", description: "New to working out or returning after a long break" },
    { id: "intermediate", label: "Intermediate", description: "Regular workout routine for at least 3 months" },
    { id: "advanced", label: "Advanced", description: "Consistently working out for over a year" },
    { id: "expert", label: "Expert", description: "Highly trained with extensive fitness knowledge" }
  ];

  const fetchSuggestions = async (fitnessLevel: string) => {
    setLoading(true);
    setCurrentFitnessLevel(fitnessLevel);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-workout-suggestions", {
        body: {
          fitnessLevel,
          goalType: "", // Could be populated from user profile
          duration: "", // Could be populated from user preference
          equipment: "", // Could be populated from user profile
          limitations: "" // Could be populated from user profile
        }
      });
      
      if (error) throw error;
      
      const response = data as WorkoutSuggestionsResponse;
      setSuggestions(response.workouts);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching workout suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to get workout suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-purple-500" />
              Workout Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="beginner" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                {fitnessLevels.map(level => (
                  <TabsTrigger 
                    key={level.id} 
                    value={level.id}
                    onClick={() => fetchSuggestions(level.label)}
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
                    variant="outline"
                    className="w-full"
                    onClick={() => fetchSuggestions(level.label)}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Get Workout Suggestions"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
        
        <DialogContent className="max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentFitnessLevel} Workout Suggestions</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {suggestions.map((workout, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      {workout.duration}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">{workout.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="py-1 px-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs">
                      {workout.difficulty}
                    </div>
                    <div className="py-1 px-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-xs">
                      ~{workout.caloriesBurned} kcal
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <h4 className="text-xs uppercase tracking-wider font-semibold mb-2 text-muted-foreground">Exercises</h4>
                    <ul className="grid grid-cols-1 gap-y-1">
                      {Array.isArray(workout.exercises) && workout.exercises.map((exercise, i) => (
                        <li key={i} className="text-sm flex items-center gap-1 p-2 bg-background/50 rounded-md">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-1"></span>
                          {typeof exercise === 'string' ? exercise : exercise.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-2">
                    <Button size="sm" variant="purple" className="gap-1">
                      <Dumbbell className="h-3.5 w-3.5" />
                      Track Workout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default WorkoutSuggestions;
