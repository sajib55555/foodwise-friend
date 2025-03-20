
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Bell, Plus, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button-custom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the form schema with Zod
const reminderFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  time: z.string().min(1, "Time is required"),
  repeatPattern: z.string().min(1, "Repeat pattern is required"),
});

type ReminderFormValues = z.infer<typeof reminderFormSchema>;

const ReminderSystem = () => {
  const [reminders, setReminders] = useState([
    { id: 1, title: "Breakfast", time: "8:00 AM", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { id: 2, title: "Lunch", time: "12:30 PM", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { id: 3, title: "Dinner", time: "7:00 PM", days: ["Every day"] }
  ]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      title: "",
      time: "",
      repeatPattern: "everyday",
    },
  });

  const handleAddReminder = (values: ReminderFormValues) => {
    // Convert the repeat pattern to days format
    let days;
    switch (values.repeatPattern) {
      case "everyday":
        days = ["Every day"];
        break;
      case "weekdays":
        days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
        break;
      case "weekends":
        days = ["Sat", "Sun"];
        break;
      case "custom":
        days = ["Custom days"];
        break;
      default:
        days = ["Every day"];
    }

    // Create a new reminder with a unique ID
    const newReminder = {
      id: Date.now(), // Use timestamp as a simple unique ID
      title: values.title,
      time: values.time,
      days: days,
    };

    // Add the new reminder to the state
    setReminders([...reminders, newReminder]);
    
    // Show success toast
    toast.success("Reminder added", {
      description: `${values.title} at ${values.time}`,
    });
    
    // Reset form and close dialog
    form.reset();
    setDialogOpen(false);
  };
  
  const handleDeleteReminder = (id: number) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
    toast.success("Reminder deleted");
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      id="meal-reminders"
    >
      <Card variant="glass" className="border border-green-300/30 dark:border-green-800/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-teal-50/20 dark:from-green-900/10 dark:to-teal-900/5 z-0"></div>
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-green-400/20 rounded-full blur-xl"></div>
        <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-teal-400/20 rounded-full blur-xl"></div>
        
        <CardHeader className="pb-2 relative z-10">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 font-bold">
                Meal Reminders
              </span>
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 relative z-10">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Meal Reminder</DialogTitle>
                  <DialogDescription>
                    Set up reminders for your daily meals
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddReminder)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reminder Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Breakfast, Snack, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="7:00 AM">7:00 AM</SelectItem>
                              <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                              <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                              <SelectItem value="1:00 PM">1:00 PM</SelectItem>
                              <SelectItem value="6:00 PM">6:00 PM</SelectItem>
                              <SelectItem value="7:00 PM">7:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="repeatPattern"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repeat</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="everyday">Every day</SelectItem>
                              <SelectItem value="weekdays">Weekdays</SelectItem>
                              <SelectItem value="weekends">Weekends</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          form.reset();
                          setDialogOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="green-gradient">
                        Add Reminder
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          {reminders.length > 0 ? (
            <ul className="space-y-2">
              {reminders.map((reminder) => (
                <li 
                  key={reminder.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-100/60 to-teal-100/40 dark:from-green-900/20 dark:to-teal-900/10 border border-green-100/40 hover:shadow-md transition-all"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-green-800 dark:text-green-300">{reminder.title}</p>
                      <p className="text-xs text-green-600/70 dark:text-green-400/70">
                        {reminder.time} • {Array.isArray(reminder.days) ? reminder.days.join(", ") : reminder.days}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 hover:bg-green-200/30"
                    onClick={() => handleDeleteReminder(reminder.id)}
                  >
                    <X className="h-4 w-4 text-green-700 dark:text-green-300" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-green-600/70 dark:text-green-400/70 text-sm">No reminders set</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReminderSystem;
