
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audio } = await req.json()
    
    if (!audio) {
      throw new Error('No audio data provided')
    }

    console.log('Received voice-to-text request, processing audio...');
    
    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio)
    
    // Prepare form data
    const formData = new FormData()
    const blob = new Blob([binaryAudio], { type: 'audio/webm' })
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'en') // Ensuring English language processing

    console.log('Sending audio to OpenAI for transcription...');
    
    // Send to OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API Error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Successfully transcribed text: "${result.text.substring(0, 50)}..."`);

    return new Response(
      JSON.stringify({ text: result.text }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error(`Voice-to-text error: ${error.message || 'Unknown error'}`);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Voice processing failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
