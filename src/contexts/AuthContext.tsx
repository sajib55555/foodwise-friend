
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthContextType } from '@/types/auth';
import { useAuthActivity } from '@/hooks/use-auth-activity';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useSubscription } from '@/hooks/use-subscription';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { logAuthActivity } = useAuthActivity();
  const { profile, setProfile, getProfile: fetchProfile } = useUserProfile();
  const { subscription, setSubscription, getSubscription: fetchSubscription } = useSubscription();

  useEffect(() => {
    const setupAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);

          if (session?.user) {
            await getProfile();
            await getSubscription();
            
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

      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();
  }, []);

  const getProfile = async () => {
    await fetchProfile(user);
  };

  const getSubscription = async () => {
    await fetchSubscription(user);
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
      
      if (user) {
        await logAuthActivity(user, 'logout', 'User signed out');
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
