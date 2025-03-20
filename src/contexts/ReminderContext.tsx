
import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserReminders, scheduleReminder, deleteReminder, sendNotification } from "@/utils/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Reminder {
  id: number;
  title: string;
  body: string;
  time: string;
  days: string[];
  active: boolean;
}

interface ReminderContextType {
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  addReminder: (title: string, body: string, time: string, days: string[]) => Promise<boolean>;
  removeReminder: (id: number) => Promise<boolean>;
  refreshReminders: () => Promise<void>;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const ReminderProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshReminders = async () => {
    if (!user) {
      setReminders([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await getUserReminders();
      setReminders(data);
    } catch (err) {
      setError("Failed to load reminders");
      console.error("Error fetching reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshReminders();
  }, [user]);

  // Set up a timer to check for reminders that need to be sent
  useEffect(() => {
    if (!user || !reminders.length) return;
    
    const checkForReminders = () => {
      const now = new Date();
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
      const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      reminders.forEach(reminder => {
        if (!reminder.active) return;
        
        const shouldSendToday = reminder.days.includes(dayOfWeek) || reminder.days.includes('Every day');
        if (!shouldSendToday) return;

        // Compare times without seconds
        const reminderTime = reminder.time.toUpperCase();
        
        // Check if it's time to send the notification
        if (reminderTime === currentTime) {
          sendNotification(reminder.title, { 
            body: reminder.body,
            icon: '/favicon.ico' 
          });
          
          // Show a toast as well
          toast({
            title: reminder.title,
            description: reminder.body,
          });
        }
      });
    };
    
    // Check every minute
    const interval = setInterval(checkForReminders, 60000);
    
    // Run once on mount
    checkForReminders();
    
    return () => clearInterval(interval);
  }, [reminders, user]);

  const addReminder = async (title: string, body: string, time: string, days: string[]) => {
    try {
      const success = await scheduleReminder(title, body, time, days);
      if (success) {
        await refreshReminders();
        toast({
          title: "Reminder added",
          description: `${title} reminder has been scheduled`,
        });
      }
      return success;
    } catch (err) {
      console.error("Error adding reminder:", err);
      toast({
        title: "Error adding reminder",
        description: "Failed to add reminder. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeReminder = async (id: number) => {
    try {
      const success = await deleteReminder(id);
      if (success) {
        setReminders(reminders.filter(r => r.id !== id));
        toast({
          title: "Reminder removed",
          description: "The reminder has been removed",
        });
      }
      return success;
    } catch (err) {
      console.error("Error removing reminder:", err);
      toast({
        title: "Error removing reminder",
        description: "Failed to remove reminder. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const value = {
    reminders,
    loading,
    error,
    addReminder,
    removeReminder,
    refreshReminders,
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error("useReminders must be used within a ReminderProvider");
  }
  return context;
};
