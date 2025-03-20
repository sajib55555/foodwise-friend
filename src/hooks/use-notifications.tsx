
import { useState, useEffect } from "react";
import { requestNotificationPermission, checkNotificationSupport } from "@/utils/notifications";
import { useToast } from "@/hooks/use-toast";

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [supported, setSupported] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkSupport = () => {
      const isSupported = checkNotificationSupport();
      setSupported(isSupported);
      
      if (isSupported && Notification.permission === "granted") {
        setPermissionGranted(true);
      }
    };
    
    checkSupport();
  }, []);

  const requestPermission = async () => {
    if (!supported) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const granted = await requestNotificationPermission();
      setPermissionGranted(granted);
      
      if (granted) {
        toast({
          title: "Notifications enabled",
          description: "You'll now receive notifications for reminders.",
        });
      } else {
        toast({
          title: "Permission denied",
          description: "You need to allow notifications to receive reminders.",
          variant: "destructive",
        });
      }
      
      return granted;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Error enabling notifications",
        description: "There was a problem enabling notifications.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    supported,
    permissionGranted,
    requestPermission,
  };
};
