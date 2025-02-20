import OpenAI from 'openai';

let openai = null;

export const initializeAI = (apiKey) => {
  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
};

export async function generateEmoji(description) {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    return {
      success: false,
      error: 'OpenAI API key not configured'
    };
  }

  if (!openai) {
    initializeAI(apiKey);
  }

  try {
    const prompt = `Create a modern emoji design following these precise specifications:

STYLE FUNDAMENTALS:
- Flat design with minimal, strategic shading
- Bold, clear shapes with 2px consistent outlines
- 8px minimum corner radius for smooth appearance
- Scalable design (readable from 512px to 32px)
- Clean silhouette and instant recognizability
- Contemporary emoji aesthetic (Apple/Google style)

TECHNICAL SPECIFICATIONS:
- Canvas: 512x512px square format
- Background: Transparent
- Color Space: sRGB
- Primary Colors: Bold, saturated tones
- Secondary Colors: Subtle highlights/shadows
- Minimum contrast ratio: 3:1
- Maximum 4 primary colors + shading

COMPOSITION RULES:
- Centered primary elements
- Strategic negative space
- Balanced visual weight
- Clear read at all sizes
- No text or numbers
- No complex patterns or textures
- No culturally sensitive elements

CONCEPT TO ILLUSTRATE:
${description}

IMPORTANT: Generate a culturally-appropriate, inclusive design that maintains professional emoji standards while being unique and expressive. Ensure the design is instantly readable and maintains its impact at both large and small scales.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
      style: "vivid",
    });

    return {
      success: true,
      imageUrl: `data:image/png;base64,${response.data[0].b64_json}`,
      revisedPrompt: response.data[0].revised_prompt
    };
  } catch (error) {
    console.error('Error generating emoji:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate emoji'
    };
  }
}

export const validateApiKey = async (apiKey) => {
  try {
    const tempClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    
    // Make a minimal API call to validate the key
    await tempClient.models.list();
    return true;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
}; 