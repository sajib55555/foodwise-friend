
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthActivity = () => {
  const logAuthActivity = async (
    user: User | null,
    activityType: string, 
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
      console.error('Error logging auth activity:', error.message);
    }
  };

  return { logAuthActivity };
};
