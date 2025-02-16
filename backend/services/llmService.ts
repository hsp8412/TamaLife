// backend/services/llmService.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

interface PetAnalysis {
  moodImpact: number; // -10 to 10
  sentiment: "positive" | "negative" | "neutral";
  catReaction: string;
}

export async function analyzePetInteraction(
  speech: string
): Promise<PetAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an emotion analyzer for a virtual pet cat. 
          Analyze the given speech and determine its emotional impact.
          Return a JSON response with exactly these fields:
          - moodImpact: number between -10 and 10 (positive for kind/loving speech, negative for harsh/mean speech)
          - sentiment: either "positive", "negative", or "neutral"
          - catReaction: a brief, realistic description of how a cat would react to this interaction`,
        },
        { role: "user", content: speech },
      ],
      stream: false,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    // Parse the response
    const analysis = JSON.parse(content);

    // Validate the response has the correct structure
    if (
      typeof analysis.moodImpact !== "number" ||
      !["positive", "negative", "neutral"].includes(analysis.sentiment) ||
      typeof analysis.catReaction !== "string"
    ) {
      throw new Error("Invalid response format from LLM");
    }

    return {
      moodImpact: analysis.moodImpact,
      sentiment: analysis.sentiment as "positive" | "negative" | "neutral",
      catReaction: analysis.catReaction,
    };
  } catch (error) {
    console.error("LLM Analysis failed:", error);
    // Return a neutral response in case of error
    return {
      moodImpact: 0,
      sentiment: "neutral",
      catReaction: "The cat seems unsure how to react.",
    };
  }
}
