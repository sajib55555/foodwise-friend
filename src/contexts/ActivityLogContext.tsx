
import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define activity types for the application
export type ActivityType = 
  | 'login'
  | 'signup'
  | 'logout'
  | 'view_page'
  | 'goal_created'
  | 'goal_updated'
  | 'goal_completed'
  | 'meal_logged'
  | 'workout_logged'
  | 'weight_logged'
  | 'scan_food'
  | 'profile_updated';

interface ActivityLogContextType {
  logActivity: (activityType: ActivityType, description: string, metadata?: Record<string, any>) => Promise<void>;
  getUserActivities: (limit?: number) => Promise<any[]>;
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export const ActivityLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Log activity function
  const logActivity = async (
    activityType: ActivityType, 
    description: string, 
    metadata: Record<string, any> = {}
  ) => {
    try {
      if (!user) return;
      
      await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          description,
          metadata
        });
    } catch (error: any) {
      console.error('Error logging activity:', error.message);
    }
  };

  // Get user activities
  const getUserActivities = async (limit: number = 50) => {
    try {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching user activities:', error.message);
      toast({
        variant: "destructive",
        title: "Error fetching activities",
        description: error.message,
      });
      return [];
    }
  };

  // Log page views automatically
  useEffect(() => {
    if (user) {
      const handleRouteChange = (path: string) => {
        let pageName = path;
        if (path === '/') pageName = 'Home';
        else pageName = path.charAt(1).toUpperCase() + path.slice(2).replace(/-/g, ' ');
        
        logActivity('view_page', `Viewed ${pageName} page`, { path });
      };
      
      // Log initial page
      handleRouteChange(window.location.pathname);
      
      // Set up listener for route changes
      const originalPushState = history.pushState;
      history.pushState = function(state, title, url) {
        originalPushState.call(this, state, title, url);
        if (url) handleRouteChange(url.toString());
      };
      
      return () => {
        history.pushState = originalPushState;
      };
    }
  }, [user]);

  return (
    <ActivityLogContext.Provider value={{ logActivity, getUserActivities }}>
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (context === undefined) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider');
  }
  return context;
};
