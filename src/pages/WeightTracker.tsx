
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import WeightHistoryList from "@/components/weight/WeightHistoryList";
import WeightChart from "@/components/weight/WeightChart";
import WeightStatsCards from "@/components/weight/WeightStatsCards";

const WeightTracker = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [weight, setWeight] = useState("");
  
  // In a real app, this would be stored in the database
  const [weightEntries, setWeightEntries] = useState<{
    id: string;
    weight: number;
    date: string;
    formattedDate: string;
  }[]>([
    { id: "1", weight: 72.5, date: "2023-10-01", formattedDate: "Oct 1" },
    { id: "2", weight: 72.1, date: "2023-10-08", formattedDate: "Oct 8" },
    { id: "3", weight: 71.8, date: "2023-10-15", formattedDate: "Oct 15" },
    { id: "4", weight: 71.2, date: "2023-10-22", formattedDate: "Oct 22" },
    { id: "5", weight: 70.5, date: "2023-10-29", formattedDate: "Oct 29" },
    { id: "6", weight: 70.1, date: "2023-11-05", formattedDate: "Nov 5" },
  ]);

  const handleAddWeight = () => {
    const weightValue = parseFloat(weight);
    
    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid weight value.",
        variant: "destructive",
      });
      return;
    }
    
    const today = new Date();
    const dateStr = format(today, "yyyy-MM-dd");
    const formattedDateStr = format(today, "MMM d");
    
    const newEntry = {
      id: Date.now().toString(),
      weight: weightValue,
      date: dateStr,
      formattedDate: formattedDateStr,
    };
    
    setWeightEntries([...weightEntries, newEntry]);
    setWeight("");
    setAddDialogOpen(false);
    
    toast({
      title: "Weight Added",
      description: "Your weight has been successfully recorded.",
    });
  };

  const handleDeleteEntry = (id: string) => {
    setWeightEntries(weightEntries.filter(entry => entry.id !== id));
    toast({
      title: "Entry Deleted",
      description: "Weight entry has been removed from your history.",
    });
  };

  return (
    <PageTransition>
      <Header title="Weight Tracker" showBackButton />
      <main className="container mx-auto px-4 pb-24 pt-6">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <WeightStatsCards weightEntries={weightEntries} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Weight Progress</CardTitle>
                  <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="purple" className="h-8">
                        <Plus className="h-4 w-4 mr-1" /> Add Weight
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Weight Entry</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            placeholder="Enter your weight"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                          />
                        </div>
                        <Button 
                          onClick={handleAddWeight}
                          className="w-full"
                          variant="purple"
                        >
                          Add Entry
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>
                  Track your weight over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeightChart weightEntries={weightEntries} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <WeightHistoryList 
              weightEntries={weightEntries} 
              onDelete={handleDeleteEntry} 
            />
          </motion.div>
        </div>
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

export default WeightTracker;
