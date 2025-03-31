
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Subscription } from '@/types/auth';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  
  const getSubscription = async (user: User | null) => {
    try {
      if (!user) return;
      
      console.log("Fetching subscription data for user:", user.id);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription', error);
        return;
      }

      console.log("Subscription data retrieved:", data);
      setSubscription(data);
      
      if (data && data.status === 'active' && data.stripe_subscription_id) {
        try {
          console.log("Fetching Stripe subscription details for:", data.stripe_subscription_id);
          
          const { data: stripeData, error: stripeError } = await supabase.functions.invoke('stripe-subscription', {
            body: {
              action: 'get-subscription-details',
              data: { subscriptionId: data.stripe_subscription_id }
            }
          });
          
          if (stripeError) {
            console.error('Error fetching Stripe subscription details:', stripeError);
            return;
          }
          
          if (stripeData && stripeData.next_billing_date) {
            console.log("Updated subscription with next billing date:", stripeData.next_billing_date);
            
            setSubscription(prev => ({
              ...prev,
              next_billing_date: stripeData.next_billing_date
            }));
          }
        } catch (stripeError) {
          console.error('Error fetching Stripe subscription details:', stripeError);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };
  
  return { 
    subscription,
    setSubscription,
    getSubscription
  };
};
