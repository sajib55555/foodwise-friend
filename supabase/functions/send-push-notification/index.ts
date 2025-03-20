
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.27.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request body
    const { title, body, userId, imageUrl } = await req.json();

    if (!title || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user device tokens
    const { data: tokens, error: tokenError } = await supabaseClient
      .from('device_tokens')
      .select('token')
      .eq('user_id', userId);

    if (tokenError) {
      console.error('Error fetching device tokens:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch device tokens' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If user has no registered devices, just return success
    if (!tokens || tokens.length === 0) {
      console.log('No device tokens found for user:', userId);
      return new Response(
        JSON.stringify({ success: true, message: 'No device tokens found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log notification data
    console.log('Sending notification:', { title, body, tokens: tokens.length });

    // In a real implementation, you would send the push notification to a service like Firebase Cloud Messaging
    // For now, we'll just simulate this by adding an entry to a notifications table
    
    const { error: insertError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        body,
        image_url: imageUrl,
        read: false,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting notification:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save notification' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        sent_to: tokens.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
