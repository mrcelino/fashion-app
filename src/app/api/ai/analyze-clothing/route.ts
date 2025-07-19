import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Check if AI features are enabled
    if (process.env.ENABLE_AI_FEATURES !== 'true' || !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'AI features are not enabled' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, message: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

    const prompt = `
    Analyze this clothing image and provide detailed information in JSON format. Please be specific and accurate.

    Return ONLY a valid JSON object with these exact fields:
    {
      "name": "Specific name of the clothing item (e.g., 'Kemeja Putih Lengan Panjang', 'Gaun Midi Floral')",
      "category": "One of: 'Pakaian Kasual', 'Pakaian Formal', 'Pakaian Olahraga', 'Aksesoris', 'Sepatu', 'Tas'",
      "description": "Detailed description in Indonesian (2-3 sentences about style, features, and suitability)",
      "color": "Primary color in Indonesian (e.g., 'Putih', 'Biru Navy', 'Hitam')",
      "condition": "One of: 'excellent', 'good', 'fair'",
      "size": "Estimated size: 'XS', 'S', 'M', 'L', 'XL', or 'XXL'",
      "tags": ["array", "of", "relevant", "tags", "in", "Indonesian"],
      "material": "Estimated material in Indonesian (e.g., 'Katun', 'Polyester', 'Denim')",
      "occasion": "Suitable occasion in Indonesian (e.g., 'Kasual', 'Formal', 'Olahraga', 'Pesta')"
    }

    Guidelines:
    - Be specific about clothing type and style
    - Use Indonesian language for all text fields
    - Estimate condition based on visible wear, wrinkles, or damage
    - Provide realistic size estimation
    - Include 3-5 relevant tags
    - Be descriptive but concise
    `;

    // Retry mechanism for API calls
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`AI Analysis attempt ${attempt}/${maxRetries}`);
        
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: imageBase64,
              mimeType: imageFile.type
            }
          }
        ]);

        const response = await result.response;
        const text = response.text();
        
        // Clean the response to extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in AI response');
        }

        const analysisResult = JSON.parse(jsonMatch[0]);
        
        // Validate the result has required fields
        const requiredFields = ['name', 'category', 'description', 'color', 'condition', 'size', 'tags', 'material', 'occasion'];
        for (const field of requiredFields) {
          if (!analysisResult[field]) {
            throw new Error(`Missing required field: ${field}`);
          }
        }

        console.log('AI Analysis successful on attempt', attempt);
        return NextResponse.json({
          success: true,
          data: analysisResult
        });

      } catch (error: any) {
        lastError = error;
        console.log(`AI Analysis attempt ${attempt} failed:`, error.message);
        
        // Check if it's a rate limit or overload error
        if (error.message?.includes('overloaded') || error.message?.includes('503') || error.message?.includes('429')) {
          if (attempt < maxRetries) {
            // Wait before retrying (exponential backoff)
            const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        } else {
          // For non-retryable errors, break immediately
          break;
        }
      }
    }
    
    // If we get here, all retries failed
    throw lastError;

  } catch (error) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal menganalisis gambar. Silakan coba lagi.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}