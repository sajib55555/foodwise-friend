
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Check if the browser supports notifications
export const checkNotificationSupport = () => {
  return "Notification" in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!checkNotificationSupport()) {
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === "granted";
};

// Send a notification
export const sendNotification = (title: string, options: NotificationOptions = {}) => {
  if (!checkNotificationSupport()) {
    console.error("Notifications not supported in this browser");
    return false;
  }
  
  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return false;
  }

  try {
    new Notification(title, options);
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
};

// Save a device token for push notifications (for mobile)
export const saveDeviceToken = async (token: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("User not authenticated");
    return false;
  }
  
  const { error } = await supabase
    .from('device_tokens')
    .upsert({ 
      user_id: user.id, 
      token, 
      created_at: new Date().toISOString() 
    });
  
  if (error) {
    console.error("Error saving device token:", error);
    return false;
  }
  
  return true;
};

// Schedule a reminder to be sent at a specific time
export const scheduleReminder = async (
  title: string,
  body: string,
  time: string,
  days: string[],
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("User not authenticated");
    return false;
  }
  
  // Store reminder in the database
  const { error } = await supabase
    .from('reminders')
    .insert({
      user_id: user.id,
      title,
      body,
      time,
      days: Array.isArray(days) ? days : [days],
      active: true
    });
  
  if (error) {
    console.error("Error scheduling reminder:", error);
    return false;
  }
  
  return true;
};

// Get all reminders for the current user
export const getUserReminders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true);
  
  if (error) {
    console.error("Error fetching reminders:", error);
    return [];
  }
  
  return data || [];
};

// Toggle reminder active status
export const toggleReminder = async (reminderId: number, active: boolean) => {
  const { error } = await supabase
    .from('reminders')
    .update({ active })
    .eq('id', reminderId);
  
  if (error) {
    console.error("Error toggling reminder:", error);
    return false;
  }
  
  return true;
};

// Delete a reminder
export const deleteReminder = async (reminderId: number) => {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', reminderId);
  
  if (error) {
    console.error("Error deleting reminder:", error);
    return false;
  }
  
  return true;
};
