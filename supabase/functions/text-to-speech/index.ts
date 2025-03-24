
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    console.log(`Processing text-to-speech request with voice: ${voice || 'alloy'}`);
    console.log(`Text length: ${text.length} characters`);
    
    // Get OpenAI API key with error handling
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    // Limit text to prevent token issues and chunking for long responses
    const maxLength = 4000;
    const processedText = text.length > maxLength 
      ? text.substring(0, maxLength) + "... I've summarized the rest for brevity."
      : text;
    
    // Generate speech from text with improved error handling and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: processedText,
          voice: voice || 'alloy', // Default to alloy voice if none specified
          response_format: 'mp3',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`OpenAI API Error: ${response.status} - ${errorBody}`);
        throw new Error(`Failed to generate speech: ${response.status}`);
      }

      // Convert audio buffer to base64
      const arrayBuffer = await response.arrayBuffer();
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );

      console.log('Successfully generated audio response');
      
      return new Response(
        JSON.stringify({ audioContent: base64Audio }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Text-to-speech request timed out');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error(`Text-to-speech error: ${error.message || 'Unknown error'}`);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Text-to-speech processing failed' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
