
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Bell, Plus, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button-custom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const ReminderSystem = () => {
  const [reminders, setReminders] = useState([
    { id: 1, title: "Breakfast", time: "8:00 AM", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { id: 2, title: "Lunch", time: "12:30 PM", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { id: 3, title: "Dinner", time: "7:00 PM", days: ["Every day"] }
  ]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleDeleteReminder = (id: number) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
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
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reminder Title</label>
                    <Input placeholder="e.g., Breakfast, Snack, etc." />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7:00 AM">7:00 AM</SelectItem>
                        <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                        <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                        <SelectItem value="1:00 PM">1:00 PM</SelectItem>
                        <SelectItem value="6:00 PM">6:00 PM</SelectItem>
                        <SelectItem value="7:00 PM">7:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Repeat</label>
                    <Select defaultValue="everyday">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyday">Every day</SelectItem>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="green-gradient" onClick={() => setDialogOpen(false)}>Add Reminder</Button>
                  </div>
                </div>
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
