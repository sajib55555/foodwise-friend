
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<any | null>(null);
  
  const getProfile = async (user: User | null) => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  
  return { 
    profile,
    setProfile,
    getProfile
  };
};
