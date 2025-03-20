
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      throw new Error("Missing Stripe secret key");
    }
    
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    
    const { action, data } = await req.json();
    
    // Get Supabase client
    const supabaseClient = getSupabaseClient(req);
    if (!supabaseClient) {
      throw new Error("User is not authenticated");
    }
    
    const userId = supabaseClient.auth.userId();
    
    switch (action) {
      case "create-checkout-session": {
        // Create checkout session for subscription
        const { priceId, successUrl, cancelUrl } = data;
        
        if (!priceId || !successUrl || !cancelUrl) {
          return new Response(
            JSON.stringify({ error: "Missing required parameters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get customer ID for the user, or create a new one
        const stripeCustomerId = await getOrCreateStripeCustomer(stripe, supabaseClient, userId);
        
        const session = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          payment_method_types: ["card"],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            user_id: userId,
          },
        });
        
        return new Response(
          JSON.stringify({ sessionId: session.id, url: session.url }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case "create-customer-portal": {
        // Create customer portal for managing subscription
        const { returnUrl } = data;
        
        if (!returnUrl) {
          return new Response(
            JSON.stringify({ error: "Missing return URL" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get customer ID for the user
        const { data: subscriptionData } = await supabaseClient
          .from("subscriptions")
          .select("stripe_customer_id")
          .eq("user_id", userId)
          .single();
          
        if (!subscriptionData || !subscriptionData.stripe_customer_id) {
          return new Response(
            JSON.stringify({ error: "No subscription found for this user" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: subscriptionData.stripe_customer_id,
          return_url: returnUrl,
        });
        
        return new Response(
          JSON.stringify({ url: portalSession.url }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case "webhook": {
        // Webhook for handling Stripe events
        const signature = req.headers.get("stripe-signature");
        
        if (!signature) {
          return new Response(
            JSON.stringify({ error: "Missing Stripe signature" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
        if (!STRIPE_WEBHOOK_SECRET) {
          throw new Error("Missing Stripe webhook secret");
        }
        
        const body = await req.text();
        let event;
        
        try {
          event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
          return new Response(
            JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Handle the event
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object;
            const userId = session.metadata.user_id;
            const subscriptionId = session.subscription;
            
            // Update subscription in database
            await supabaseClient
              .from("subscriptions")
              .update({
                status: "active",
                stripe_subscription_id: subscriptionId,
                stripe_customer_id: session.customer,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", userId);
            
            break;
          }
          
          case "customer.subscription.deleted": {
            const subscription = event.data.object;
            
            // Find the user with this subscription
            const { data: subscriptionData } = await supabaseClient
              .from("subscriptions")
              .select("user_id")
              .eq("stripe_subscription_id", subscription.id)
              .single();
              
            if (subscriptionData) {
              // Update subscription status in database
              await supabaseClient
                .from("subscriptions")
                .update({
                  status: "canceled",
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", subscriptionData.user_id);
            }
            
            break;
          }
          
          case "customer.subscription.updated": {
            const subscription = event.data.object;
            
            // Find the user with this subscription
            const { data: subscriptionData } = await supabaseClient
              .from("subscriptions")
              .select("user_id")
              .eq("stripe_subscription_id", subscription.id)
              .single();
              
            if (subscriptionData) {
              // Update subscription status in database
              await supabaseClient
                .from("subscriptions")
                .update({
                  status: subscription.status === "active" ? "active" : subscription.status,
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", subscriptionData.user_id);
            }
            
            break;
          }
        }
        
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Stripe function error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to get Supabase client from request
function getSupabaseClient(req) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  
  const supabaseKey = req.headers.get("apikey");
  if (!supabaseKey) return null;
  
  // In a real implementation, you'd use the Supabase client here
  // This is a simplified version
  return {
    auth: {
      userId: () => {
        try {
          const token = authHeader.replace("Bearer ", "");
          // In a real implementation, verify the JWT and extract the user ID
          // This is a simplified version
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload.sub;
        } catch (error) {
          return null;
        }
      },
    },
    from: (table) => {
      // In a real implementation, you'd create a query builder
      // This is a simplified version that just returns fake data
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null }),
          }),
        }),
        update: () => ({
          eq: async () => ({ error: null }),
        }),
      };
    },
  };
}

// Helper function to get or create a Stripe customer for a user
async function getOrCreateStripeCustomer(stripe, supabaseClient, userId) {
  // Check if user already has a customer ID
  const { data: subscriptionData } = await supabaseClient
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();
    
  if (subscriptionData && subscriptionData.stripe_customer_id) {
    return subscriptionData.stripe_customer_id;
  }
  
  // Get user email from profiles
  const { data: profileData } = await supabaseClient
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();
    
  if (!profileData) {
    throw new Error("User profile not found");
  }
  
  // Create a new customer
  const customer = await stripe.customers.create({
    email: profileData.email,
    name: profileData.full_name,
    metadata: {
      user_id: userId,
    },
  });
  
  // Save customer ID to user's subscription
  await supabaseClient
    .from("subscriptions")
    .update({
      stripe_customer_id: customer.id,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
    
  return customer.id;
}
