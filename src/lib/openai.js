import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function generateEmoji(description) {
  try {
    const prompt = `Create a simple, expressive emoji in a modern style based on this description: ${description}. The emoji should be clear, minimalist, and suitable for use as an actual emoji. Make it centered and isolated on a transparent background.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
      style: "natural",
    });

    return {
      url: response.data[0].url,
      revisedPrompt: response.data[0].revised_prompt,
    };
  } catch (error) {
    console.error('Error generating emoji:', error);
    throw new Error(error.message);
  }
} 