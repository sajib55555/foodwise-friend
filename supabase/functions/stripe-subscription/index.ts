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
      console.error("Missing Stripe secret key");
      return new Response(
        JSON.stringify({ error: "Missing Stripe secret key" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Invalid request body:", error);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { action, data } = body;
    
    if (!action) {
      console.error("Missing action parameter");
      return new Response(
        JSON.stringify({ error: "Missing action parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get user ID from JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      
      console.log("Authenticated user ID:", userId);
    } catch (error) {
      console.error("Error extracting user ID:", error);
      return new Response(
        JSON.stringify({ error: "Invalid authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    switch (action) {
      case "create-checkout-session": {
        console.log("Creating checkout session for user:", userId);
        // Create checkout session for subscription
        const { priceId, successUrl, cancelUrl } = data;
        
        if (!priceId || !successUrl || !cancelUrl) {
          console.error("Missing required parameters:", { priceId, successUrl, cancelUrl });
          return new Response(
            JSON.stringify({ error: "Missing required parameters for checkout session" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        try {
          // Check if user already has a customer ID in the database
          const supabaseUrl = Deno.env.get("SUPABASE_URL");
          const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
          
          if (!supabaseUrl || !supabaseKey) {
            console.error("Missing Supabase credentials");
            return new Response(
              JSON.stringify({ error: "Missing Supabase credentials" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          const response = await fetch(
            `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&select=stripe_customer_id`, 
            {
              headers: {
                "Authorization": `Bearer ${supabaseKey}`,
                "apikey": supabaseKey,
              },
            }
          );
          
          const subscriptionData = await response.json();
          let customerId;
          
          // If user already has a customer ID, use it
          if (subscriptionData && subscriptionData[0] && subscriptionData[0].stripe_customer_id) {
            customerId = subscriptionData[0].stripe_customer_id;
            console.log("Using existing Stripe customer:", customerId);
          } else {
            // Create a new customer if none exists
            const customer = await stripe.customers.create({
              metadata: {
                user_id: userId,
              },
            });
            customerId = customer.id;
            console.log("Created new Stripe customer:", customerId);
          }
          
          // Create checkout session
          const session = await stripe.checkout.sessions.create({
            customer: customerId,
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
          
          console.log("Created checkout session:", session.id);
          
          return new Response(
            JSON.stringify({ sessionId: session.id, url: session.url }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (error) {
          console.error("Stripe error creating checkout session:", error);
          return new Response(
            JSON.stringify({ 
              error: "Failed to create checkout session", 
              details: error.message 
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      case "create-customer-portal": {
        console.log("Creating customer portal for user:", userId);
        // Create customer portal for managing subscription
        const { returnUrl } = data;
        
        if (!returnUrl) {
          console.error("Missing return URL");
          return new Response(
            JSON.stringify({ error: "Missing return URL" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        try {
          // Get customer ID for the user from subscriptions table
          const supabaseUrl = Deno.env.get("SUPABASE_URL");
          const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
          
          if (!supabaseUrl || !supabaseKey) {
            console.error("Missing Supabase credentials");
            return new Response(
              JSON.stringify({ error: "Missing Supabase credentials" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          const response = await fetch(
            `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&select=stripe_customer_id`, 
            {
              headers: {
                "Authorization": `Bearer ${supabaseKey}`,
                "apikey": supabaseKey,
              },
            }
          );
          
          if (!response.ok) {
            console.error(`Failed to fetch customer ID: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch customer ID: ${response.status} ${response.statusText}`);
          }
          
          const subscriptionData = await response.json();
          
          if (!subscriptionData || !subscriptionData[0] || !subscriptionData[0].stripe_customer_id) {
            console.error("No subscription found for this user");
            return new Response(
              JSON.stringify({ error: "No subscription found for this user" }),
              { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          const customerId = subscriptionData[0].stripe_customer_id;
          console.log("Found Stripe customer ID:", customerId);
          
          const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
          });
          
          console.log("Created customer portal session");
          
          return new Response(
            JSON.stringify({ url: portalSession.url }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (error) {
          console.error("Error creating customer portal:", error);
          return new Response(
            JSON.stringify({ 
              error: "Failed to create customer portal", 
              details: error.message 
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      case "get-subscription-details": {
        console.log("Getting subscription details for:", userId);
        // Get subscription details from Stripe
        const { subscriptionId } = data;
        
        if (!subscriptionId) {
          console.error("Missing subscription ID");
          return new Response(
            JSON.stringify({ error: "Missing subscription ID" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        try {
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
        } catch (error) {
          console.error("Error retrieving subscription details:", error);
          return new Response(
            JSON.stringify({ 
              error: "Failed to retrieve subscription details", 
              details: error.message 
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      case "webhook": {
        // Webhook for handling Stripe events
        const signature = req.headers.get("stripe-signature");
        
        if (!signature) {
          console.error("Missing Stripe signature");
          return new Response(
            JSON.stringify({ error: "Missing Stripe signature" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
        if (!STRIPE_WEBHOOK_SECRET) {
          console.error("Missing Stripe webhook secret");
          return new Response(
            JSON.stringify({ error: "Missing Stripe webhook secret" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const body = await req.text();
        let event;
        
        try {
          event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
          console.error(`Webhook signature verification failed: ${err.message}`);
          return new Response(
            JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Handle the event
        // Update Supabase directly with fetch
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        
        if (!supabaseUrl || !supabaseKey) {
          console.error("Missing Supabase credentials");
          return new Response(
            JSON.stringify({ error: "Missing Supabase credentials" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object;
            const userId = session.metadata.user_id;
            const subscriptionId = session.subscription;
            
            console.log("Checkout session completed for user:", userId);
            
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
            
            console.log("Subscription deleted:", subscription.id);
            
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
              console.log("Updating subscription status to canceled for user:", subscriptionData[0].user_id);
              
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
            
            console.log("Subscription updated:", subscription.id);
            
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
              console.log("Updating subscription status for user:", subscriptionData[0].user_id);
              
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
        console.error("Invalid action:", action);
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Stripe function error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
