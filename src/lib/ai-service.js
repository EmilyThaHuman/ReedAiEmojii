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
    const prompt = `Create a simple, expressive emoji in a modern style based on this description: ${description}. The emoji should be clear, minimalist, and suitable for use as an actual emoji. Make it centered and isolated on a transparent background.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
      style: "natural",
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