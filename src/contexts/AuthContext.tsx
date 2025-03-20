import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  status: string;
  trial_ends_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  subscription: Subscription | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  getProfile: () => Promise<void>;
  getSubscription: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Log activity function (simplified, will be replaced by ActivityLogContext)
  const logAuthActivity = async (
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

  const refreshUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setUser(data.user);
      await getProfile();
      await getSubscription();
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);

          if (session?.user) {
            await getProfile();
            await getSubscription();
            
            // Log login event if applicable
            if (event === 'SIGNED_IN') {
              await supabase
                .from('user_activity_logs')
                .insert({
                  user_id: session.user.id,
                  activity_type: 'login',
                  description: 'User signed in',
                  metadata: { provider: session.user.app_metadata.provider || 'email' }
                });
            }
          }
        }
      );

      // Clean up on unmount
      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();
  }, []);

  const getProfile = async () => {
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

  const getSubscription = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription', error);
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error signing in",
          description: error.message,
        });
        return Promise.reject(error);
      }

      await getProfile();
      await getSubscription();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message,
      });
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error signing up",
          description: error.message,
        });
        return Promise.reject(error);
      }

      toast({
        title: "Account created",
        description: "Welcome to FoodWise! Your 14-day trial has started.",
      });
      
      // We don't need to log signup here as it will be captured by the onAuthStateChange
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: error.message,
      });
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Log logout before actually signing out
      if (user) {
        await supabase
          .from('user_activity_logs')
          .insert({
            user_id: user.id,
            activity_type: 'logout',
            description: 'User signed out'
          });
      }
      
      await supabase.auth.signOut();
      setProfile(null);
      setSubscription(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    profile,
    subscription,
    isLoading,
    signIn,
    signUp,
    signOut,
    getProfile,
    getSubscription,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
