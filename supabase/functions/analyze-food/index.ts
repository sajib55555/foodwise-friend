
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
    const { imageData, barcode } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured')
    }

    // If we have a barcode, we can use it to search for product information
    // This is a mock implementation since we're not connecting to a real product database
    if (barcode) {
      return new Response(
        JSON.stringify({
          productInfo: {
            name: "Analyzed product from barcode " + barcode,
            brand: "Analysis Result",
            calories: 120,
            protein: 15,
            carbs: 8,
            fat: 5,
            healthScore: 7.5,
            ingredients: [
              { name: "Ingredient 1", healthy: true },
              { name: "Ingredient 2", healthy: true },
              { name: "Ingredient 3", healthy: false, warning: "High in sodium" },
            ],
            warnings: ["Contains moderate sodium"],
            recommendations: ["Good source of protein", "Contains essential nutrients"]
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For image analysis, we'll use OpenAI's API
    if (!imageData) {
      throw new Error('No image data provided')
    }

    // Remove the prefix from base64 data if present
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
            
            Format the response as a JSON object with these fields:
            name, calories, protein, carbs, fat, ingredients (array of objects with name, healthy, and optional warning), healthScore, 
            warnings (array of strings), and recommendations (array of strings).`
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
        max_tokens: 1000,
      }),
    })

    const data = await response.json()
    
    // Parse the response content as JSON
    let analysisResult
    try {
      analysisResult = JSON.parse(data.choices[0].message.content)
      
      // Ensure all fields are present in the response
      const requiredFields = ['name', 'calories', 'protein', 'carbs', 'fat', 'ingredients', 'healthScore', 'warnings', 'recommendations'];
      const missingFields = requiredFields.filter(field => !analysisResult[field]);
      
      if (missingFields.length > 0) {
        console.log('Missing fields in analysis:', missingFields);
        // Set default values for missing fields
        missingFields.forEach(field => {
          if (field === 'ingredients') {
            analysisResult[field] = [];
          } else if (field === 'warnings' || field === 'recommendations') {
            analysisResult[field] = [];
          } else if (field === 'healthScore') {
            analysisResult[field] = 5;
          } else if (['calories', 'protein', 'carbs', 'fat'].includes(field)) {
            analysisResult[field] = 0;
          } else {
            analysisResult[field] = 'Unknown';
          }
        });
      }
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      // If parsing fails, use the raw text
      return new Response(
        JSON.stringify({
          productInfo: {
            name: "Food Analysis Result",
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            healthScore: 5,
            ingredients: [],
            warnings: ["Unable to analyze image properly"],
            recommendations: ["Try taking a clearer picture of the food"]
          },
          rawAnalysis: data.choices[0].message.content
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        productInfo: analysisResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
