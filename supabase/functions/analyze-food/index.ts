
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
      console.log(`Processing barcode: ${barcode}`)
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
            recommendations: ["Good source of protein", "Contains essential nutrients"],
            servingSize: "100g",
            vitamins: [
              { name: "Vitamin A", amount: "10% DV" },
              { name: "Vitamin C", amount: "15% DV" },
              { name: "Calcium", amount: "8% DV" },
              { name: "Iron", amount: "12% DV" }
            ],
            minerals: [
              { name: "Potassium", amount: "320mg" },
              { name: "Magnesium", amount: "56mg" }
            ],
            dietary: {
              vegan: false,
              vegetarian: true,
              glutenFree: true,
              dairyFree: false
            }
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
            
            Also analyze for vitamins, minerals, and dietary properties (vegan, vegetarian, gluten-free, dairy-free).
            
            Format the response as a JSON object with these fields:
            name, servingSize, calories, protein, carbs, fat, ingredients (array of objects with name, healthy, and optional warning), 
            healthScore, warnings (array of strings), recommendations (array of strings),
            vitamins (array of objects with name and amount), minerals (array of objects with name and amount),
            and dietary (object with vegan, vegetarian, glutenFree, dairyFree as booleans).
            
            IMPORTANT: Always use true/false as boolean values, never use strings like "moderate" or "high" as boolean values. 
            If something is in-between, either mark it as false with a note, or use a separate property.
            For example: { "name": "Cheese", "healthy": false, "note": "Moderate in fat" }`
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
    })

    const data = await response.json()
    console.log('Received response from OpenAI')
    
    if (data.error) {
      console.error('OpenAI API error:', data.error)
      throw new Error(`OpenAI API error: ${data.error.message || 'Unknown error'}`)
    }
    
    // Parse the response content as JSON
    let analysisResult
    try {
      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error('Unexpected response format from OpenAI:', JSON.stringify(data))
        throw new Error('Invalid response from AI service')
      }
      
      console.log('AI response content:', data.choices[0].message.content.substring(0, 100) + '...')
      
      // Improved JSON parsing with pre-processing
      let contentText = data.choices[0].message.content
      
      // Handle markdown code blocks
      if (contentText.includes('```json')) {
        contentText = contentText.split('```json')[1].split('```')[0].trim()
      } else if (contentText.includes('```')) {
        contentText = contentText.split('```')[1].split('```')[0].trim()
      }
      
      // Fix common JSON parsing issues - replace unquoted values
      contentText = contentText
        .replace(/"healthy"\s*:\s*moderate/g, '"healthy": false')
        .replace(/"healthy"\s*:\s*high/g, '"healthy": false')
        .replace(/"healthy"\s*:\s*low/g, '"healthy": true')
      
      analysisResult = JSON.parse(contentText)
      
      // Ensure all fields are present in the response
      const requiredFields = ['name', 'calories', 'protein', 'carbs', 'fat', 'ingredients', 'healthScore', 'warnings', 'recommendations', 'servingSize', 'vitamins', 'minerals', 'dietary'];
      const missingFields = requiredFields.filter(field => !analysisResult[field]);
      
      if (missingFields.length > 0) {
        console.log('Missing fields in analysis:', missingFields);
        // Set default values for missing fields
        missingFields.forEach(field => {
          if (['ingredients', 'warnings', 'recommendations', 'vitamins', 'minerals'].includes(field)) {
            analysisResult[field] = [];
          } else if (field === 'healthScore') {
            analysisResult[field] = 5;
          } else if (field === 'dietary') {
            analysisResult[field] = {
              vegan: false,
              vegetarian: false,
              glutenFree: false,
              dairyFree: false
            };
          } else if (field === 'servingSize') {
            analysisResult[field] = '100g';
          } else if (['calories', 'protein', 'carbs', 'fat'].includes(field)) {
            analysisResult[field] = 0;
          } else {
            analysisResult[field] = 'Unknown';
          }
        });
      }
      
      // Ensure all ingredients have a healthy property
      if (analysisResult.ingredients && Array.isArray(analysisResult.ingredients)) {
        analysisResult.ingredients = analysisResult.ingredients.map(ingredient => {
          if (typeof ingredient.healthy === 'undefined') {
            ingredient.healthy = true;
          }
          // Convert non-boolean healthy values to boolean
          if (typeof ingredient.healthy !== 'boolean') {
            const originalValue = ingredient.healthy;
            ingredient.healthy = false;
            if (!ingredient.warning && originalValue) {
              ingredient.warning = `Moderate (${originalValue})`;
            }
          }
          return ingredient;
        });
      }
      
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      // Include the raw text in the response
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
            recommendations: ["Try taking a clearer picture of the food"],
            servingSize: "100g",
            vitamins: [],
            minerals: [],
            dietary: {
              vegan: false,
              vegetarian: false,
              glutenFree: false,
              dairyFree: false
            }
          },
          rawAnalysis: data.choices[0].message.content
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully analyzed food image')
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
