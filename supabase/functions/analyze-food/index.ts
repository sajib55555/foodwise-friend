
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageData } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured')
      throw new Error('OpenAI API key is not configured')
    }

    // For image analysis, we'll use OpenAI's API
    if (!imageData) {
      console.error('No image data provided')
      throw new Error('No image data provided')
    }

    // Fix: Properly handle image data format
    let base64Data = imageData;
    
    // Remove the prefix from base64 data if present
    if (imageData.includes('base64,')) {
      base64Data = imageData.split('base64,')[1]
      console.log('Image data prefix removed')
    }

    // Log the length of the image data for debugging
    console.log(`Processing image data of length: ${base64Data.length} characters`)

    // Make sure we have valid image data
    if (!base64Data || base64Data.length < 100) {
      console.error('Invalid or too small image data')
      throw new Error('Invalid image data. Please try again with a clearer image.')
    }

    console.log('Sending request to OpenAI API...')
    
    // Create an AbortController for the fetch request
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 20000); // 20 second timeout
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',  // Using gpt-4o
          messages: [
            {
              role: 'system',
              content: `You are a nutrition expert analyzing food images. 
              
              Identify the food, estimate nutritional content (calories, protein, carbs, fat), 
              list ingredients, provide a health score from 1-10, and give diet recommendations. 
              
              Be precise with your nutritional estimates if possible, based on standard serving sizes.
              For each ingredient, determine if it's healthy or not, and provide warnings for unhealthy ingredients.
              
              When calculating the health score, consider balanced macronutrients, presence of whole foods vs processed foods,
              nutrient density, and overall dietary value.
              
              Also analyze for vitamins, minerals, and dietary properties (vegan, vegetarian, gluten-free, dairy-free).
              
              Format the response as a JSON object with these fields:
              name, servingSize, calories, protein, carbs, fat, ingredients (array of objects with name, healthy, and optional warning), 
              healthScore, warnings (array of strings), recommendations (array of strings),
              vitamins (array of objects with name and amount), minerals (array of objects with name and amount),
              and dietary (object with vegan, vegetarian, glutenFree, dairyFree as booleans).
              
              IMPORTANT: Always use true/false as boolean values, never use strings like "moderate" or "high" as boolean values. 
              If something is in-between, either mark it as false with a note, or use a separate property.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Data}`
                  }
                },
                {
                  type: 'text',
                  text: 'Analyze this food image and provide detailed nutritional information.'
                }
              ]
            }
          ],
          max_tokens: 1500,
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      
      const data = await response.json();
      console.log('Received response from OpenAI')
      
      if (data.error) {
        console.error('OpenAI API error:', data.error)
        throw new Error(`OpenAI API error: ${data.error.message || 'Unknown error'}`)
      }
      
      // Verify we have a valid response with content
      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid or empty response from OpenAI')
        throw new Error('Invalid response from OpenAI')
      }

      // Parse the response content as JSON and validate it
      let contentText = data.choices[0].message.content;
      let analysisResult;
      
      try {
        // Handle markdown code blocks
        if (contentText.includes('```json')) {
          contentText = contentText.split('```json')[1].split('```')[0].trim();
        } else if (contentText.includes('```')) {
          contentText = contentText.split('```')[1].split('```')[0].trim();
        }
        
        analysisResult = JSON.parse(contentText);
        
        // Validate required fields
        const requiredFields = ['name', 'calories', 'protein', 'carbs', 'fat', 'ingredients', 'healthScore'];
        for (const field of requiredFields) {
          if (!analysisResult[field]) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
        
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        throw new Error('Failed to parse analysis results');
      }

      return new Response(
        JSON.stringify({
          productInfo: analysisResult
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Analysis request timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        status: 'error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.name === 'AbortError' ? 504 : 500
      }
    )
  }
})
