
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
    
    // Get user ID from JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }
    
    let userId;
    try {
      // Extract user ID from JWT token
      const token = authHeader.replace("Bearer ", "");
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.sub;
      
      if (!userId) {
        throw new Error("Invalid authorization token");
      }
    } catch (error) {
      console.error("Error extracting user ID:", error);
      throw new Error("Invalid authorization token");
    }
    
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
        
        // Create a new customer
        const customer = await stripe.customers.create({
          metadata: {
            user_id: userId,
          },
        });
        
        const session = await stripe.checkout.sessions.create({
          customer: customer.id,
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
        
        // Get customer ID for the user from subscriptions table
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || `https://${Deno.env.get("SUPABASE_ID")}.supabase.co`;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_KEY");
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Missing Supabase credentials");
        }
        
        const response = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&select=stripe_customer_id`, {
          headers: {
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseKey,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch customer ID");
        }
        
        const subscriptionData = await response.json();
        
        if (!subscriptionData || !subscriptionData[0] || !subscriptionData[0].stripe_customer_id) {
          return new Response(
            JSON.stringify({ error: "No subscription found for this user" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: subscriptionData[0].stripe_customer_id,
          return_url: returnUrl,
        });
        
        return new Response(
          JSON.stringify({ url: portalSession.url }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case "get-subscription-details": {
        // Get subscription details from Stripe
        const { subscriptionId } = data;
        
        if (!subscriptionId) {
          return new Response(
            JSON.stringify({ error: "Missing subscription ID" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Calculate next billing date
        const currentPeriodEnd = subscription.current_period_end * 1000; // Convert to milliseconds
        const next_billing_date = new Date(currentPeriodEnd).toISOString();
        
        return new Response(
          JSON.stringify({ 
            next_billing_date,
            status: subscription.status
          }),
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
        // Update Supabase directly with fetch
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || `https://${Deno.env.get("SUPABASE_ID")}.supabase.co`;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_KEY");
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Missing Supabase credentials");
        }
        
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object;
            const userId = session.metadata.user_id;
            const subscriptionId = session.subscription;
            
            // Update subscription in database
            await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}`, {
              method: "PATCH",
              headers: {
                "Authorization": `Bearer ${supabaseKey}`,
                "apikey": supabaseKey,
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
              },
              body: JSON.stringify({
                status: "active",
                stripe_subscription_id: subscriptionId,
                stripe_customer_id: session.customer,
                updated_at: new Date().toISOString(),
              }),
            });
            
            break;
          }
          
          case "customer.subscription.deleted": {
            const subscription = event.data.object;
            
            // Find the user with this subscription
            const response = await fetch(
              `${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscription.id}&select=user_id`, 
              {
                headers: {
                  "Authorization": `Bearer ${supabaseKey}`,
                  "apikey": supabaseKey,
                },
              }
            );
            
            const subscriptionData = await response.json();
              
            if (subscriptionData && subscriptionData[0]) {
              // Update subscription status in database
              await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${subscriptionData[0].user_id}`, {
                method: "PATCH",
                headers: {
                  "Authorization": `Bearer ${supabaseKey}`,
                  "apikey": supabaseKey,
                  "Content-Type": "application/json",
                  "Prefer": "return=minimal",
                },
                body: JSON.stringify({
                  status: "canceled",
                  updated_at: new Date().toISOString(),
                }),
              });
            }
            
            break;
          }
          
          case "customer.subscription.updated": {
            const subscription = event.data.object;
            
            // Find the user with this subscription
            const response = await fetch(
              `${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscription.id}&select=user_id`, 
              {
                headers: {
                  "Authorization": `Bearer ${supabaseKey}`,
                  "apikey": supabaseKey,
                },
              }
            );
            
            const subscriptionData = await response.json();
              
            if (subscriptionData && subscriptionData[0]) {
              // Update subscription status in database
              await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${subscriptionData[0].user_id}`, {
                method: "PATCH",
                headers: {
                  "Authorization": `Bearer ${supabaseKey}`,
                  "apikey": supabaseKey,
                  "Content-Type": "application/json",
                  "Prefer": "return=minimal",
                },
                body: JSON.stringify({
                  status: subscription.status === "active" ? "active" : subscription.status,
                  updated_at: new Date().toISOString(),
                }),
              });
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
