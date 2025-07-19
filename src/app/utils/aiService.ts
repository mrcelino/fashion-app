import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AIAnalysisResult {
  name: string;
  category: string;
  description: string;
  color: string;
  condition: string;
  size: string;
  tags: string[];
  material: string;
  occasion: string;
}

export async function analyzeClothingImage(imageFile: File): Promise<AIAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

    // Convert image to base64
    const imageBase64 = await fileToBase64(imageFile);
    
    const prompt = `
    Analyze this clothing image and provide detailed information in JSON format. Please be specific and accurate.

    Return ONLY a valid JSON object with these exact fields:
    {
      "name": "Specific name of the clothing item (e.g., 'Kemeja Putih Lengan Panjang', 'Gaun Midi Floral')",
      "category": "One of: 'Aksesoris', 'Alas Kaki', 'Celana', 'Pakaian Anak', 'Pakaian Kasual', 'Pakaian Formal', 'Pakaian Olahraga', 'Pakaian Luar', 'Pakaian Tradisional'",
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

    return analysisResult;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error('Gagal menganalisis gambar. Silakan coba lagi.');
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (data:image/jpeg;base64,)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// Check if AI features are enabled
export function isAIEnabled(): boolean {
  return process.env.ENABLE_AI_FEATURES === 'true' && !!process.env.GEMINI_API_KEY;
}