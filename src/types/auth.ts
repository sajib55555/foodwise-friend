
import { Session, User } from '@supabase/supabase-js';

export interface Subscription {
  status: string;
  trial_ends_at: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_price_id?: string | null;
  next_billing_date?: string | null;
}

export interface AuthContextType {
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
}
