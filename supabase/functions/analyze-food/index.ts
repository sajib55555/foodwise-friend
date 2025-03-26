
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
      console.error('OpenAI API key is not configured')
      throw new Error('OpenAI API key is not configured')
    }

    // If we have a barcode, use it to search for product information
    if (barcode) {
      console.log(`Processing barcode: ${barcode}`)
      
      try {
        // Use Open Food Facts API to get real product data
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
          method: 'GET',
          headers: {
            'User-Agent': 'NutriTrack App - For Educational Purposes'
          }
        });
        
        const data = await response.json();
        
        if (data.status === 1 && data.product) {
          const product = data.product;
          
          // Parse nutrition facts
          const nutriments = product.nutriments || {};
          
          // Parse ingredients
          const ingredientsList = [];
          if (product.ingredients) {
            for (const ingredient of product.ingredients) {
              ingredientsList.push({
                name: ingredient.text || ingredient.id,
                healthy: ingredient.vegan === "yes" || ingredient.vegetarian === "yes" || false,
                warning: ingredient.vegan !== "yes" ? "May not be vegan" : null
              });
            }
          }
          
          // Generate health score (simple algorithm, could be improved)
          let healthScore = 5;
          if (nutriments["nutrition-score-fr_100g"]) {
            // Convert nutrition score (-15 to +40) to health score (0-10)
            const ns = nutriments["nutrition-score-fr_100g"];
            healthScore = ns < 0 ? 7 + (-ns / 15) * 3 : 7 - (ns / 40) * 7;
            healthScore = Math.min(10, Math.max(0, healthScore));
            healthScore = parseFloat(healthScore.toFixed(1));
          }
          
          // Prepare warnings and recommendations
          const warnings = [];
          const recommendations = [];
          
          if (nutriments.salt_100g && nutriments.salt_100g > 1.5) {
            warnings.push("High in sodium");
          }
          
          if (nutriments.sugars_100g && nutriments.sugars_100g > 10) {
            warnings.push("High in sugars");
          }
          
          if (nutriments.saturated_fat_100g && nutriments.saturated_fat_100g > 5) {
            warnings.push("High in saturated fat");
          }
          
          if (nutriments.fiber_100g && nutriments.fiber_100g > 6) {
            recommendations.push("Good source of fiber");
          }
          
          if (nutriments.proteins_100g && nutriments.proteins_100g > 10) {
            recommendations.push("Good source of protein");
          }
          
          // Compile the product info
          const productInfo = {
            name: product.product_name || "Unknown Product",
            brand: product.brands || "Unknown Brand",
            calories: nutriments.energy_value || nutriments["energy-kcal_100g"] || 0,
            protein: nutriments.proteins_100g || 0,
            carbs: nutriments.carbohydrates_100g || 0,
            fat: nutriments.fat_100g || 0,
            healthScore: healthScore,
            ingredients: ingredientsList.length > 0 ? ingredientsList : [
              { name: "No ingredient data available", healthy: false }
            ],
            warnings: warnings.length > 0 ? warnings : ["Limited nutritional data available"],
            recommendations: recommendations.length > 0 ? recommendations : ["Consume in moderation"],
            servingSize: product.serving_size || "100g",
            vitamins: [
              { name: "No detailed vitamin data available", amount: "0% DV" }
            ],
            minerals: [
              { name: "No detailed mineral data available", amount: "0mg" }
            ],
            dietary: {
              vegan: product.vegan === "yes" || false,
              vegetarian: product.vegetarian === "yes" || false,
              glutenFree: product.allergens_tags ? !product.allergens_tags.includes("en:gluten") : false,
              dairyFree: product.allergens_tags ? !product.allergens_tags.includes("en:milk") : false
            }
          };
          
          return new Response(
            JSON.stringify({
              productInfo: productInfo
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Product not found in database
          console.log("Product not found in Open Food Facts database");
          return new Response(
            JSON.stringify({
              productInfo: {
                name: "Product not found",
                brand: "Unknown",
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                healthScore: 5,
                ingredients: [
                  { name: "No data available", healthy: false }
                ],
                warnings: ["Product not found in database"],
                recommendations: ["Try scanning a different product or take a photo instead"],
                servingSize: "100g",
                vitamins: [],
                minerals: [],
                dietary: {
                  vegan: false,
                  vegetarian: false,
                  glutenFree: false,
                  dairyFree: false
                }
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (fetchError) {
        console.error("Error fetching product data:", fetchError);
        throw new Error("Failed to fetch product data from database");
      }
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

    // OPTIMIZATIONS START
    console.log('Sending request to OpenAI API...')
    
    // Create optimized request with faster timeouts and performance settings
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 15000); // 15 second timeout (reduced from previous value)
    
    try {
      // Mock response for debugging
      if (Deno.env.get('DEMO_MODE') === 'true') {
        // Wait a bit to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        clearTimeout(timeout);
        return new Response(
          JSON.stringify({
            productInfo: {
              name: "Salad with Grilled Chicken",
              calories: 320,
              protein: 28,
              carbs: 15,
              fat: 14,
              healthScore: 8.5,
              ingredients: [
                { name: "Chicken breast", healthy: true },
                { name: "Mixed greens", healthy: true },
                { name: "Tomatoes", healthy: true },
                { name: "Olive oil", healthy: true },
                { name: "Balsamic vinegar", healthy: true }
              ],
              warnings: ["Moderate fat content"],
              recommendations: ["Excellent source of protein", "Rich in vitamins"],
              servingSize: "1 bowl (300g)",
              confidence: 92,
              vitamins: [
                { name: "Vitamin A", amount: "25% DV" },
                { name: "Vitamin C", amount: "30% DV" }
              ],
              minerals: [
                { name: "Iron", amount: "15% DV" },
                { name: "Calcium", amount: "8% DV" }
              ],
              dietary: {
                vegan: false,
                vegetarian: false,
                glutenFree: true,
                dairyFree: true
              }
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',  // Use the faster, more efficient model
          messages: [
            {
              role: 'system',
              content: `You are a specialized food analysis AI that quickly identifies food and provides accurate nutritional estimates.
              
              Identify the food in the image and provide:
              - Food name and estimated serving size
              - Nutritional content (calories, protein, carbs, fat)
              - Main ingredients with healthy/unhealthy flags
              - Health score (1-10)
              - 1-2 key dietary warnings or considerations
              - 1-2 quick recommendations
              
              Be very concise and direct. Focus only on providing the nutritional data.
              Respond with specific numbers rather than ranges.
              
              Format response as JSON with these fields:
              name, servingSize, calories, protein, carbs, fat, ingredients (array of objects with name, healthy boolean, optional warning), 
              healthScore (number), warnings (array), recommendations (array),
              vitamins (array of objects with name and amount), minerals (array of objects with name and amount),
              dietary (object with vegan, vegetarian, glutenFree, dairyFree as booleans).`
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
                  text: 'Analyze this food image and provide detailed nutritional information quickly.'
                }
              ]
            }
          ],
          max_tokens: 600, // Reduced for faster response
          temperature: 0.1, // Lower temperature for more consistent responses
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
