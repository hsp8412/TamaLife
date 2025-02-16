// backend/services/llmService.ts
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error("DEEPSEEK_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

interface PetAnalysis {
  moodImpact: number;
  sentiment: "positive" | "negative" | "neutral";
  catReaction: string;
}

export async function analyzePetInteraction(
  speech: string
): Promise<PetAnalysis> {
  try {
    console.log("📝 Processing speech:", speech);

    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an emotion analyzer for a virtual pet cat. Analyze the speech and return ONLY a JSON object.
          
For example:
For positive speech: {"moodImpact": 7, "sentiment": "positive", "catReaction": "Purrs loudly and rubs against your leg"}
For negative speech: {"moodImpact": -5, "sentiment": "negative", "catReaction": "Flattens ears and backs away"}
For neutral speech: {"moodImpact": 0, "sentiment": "neutral", "catReaction": "Glances briefly and continues current activity"}

Rules:
1. Positive speech (praise, love) = positive impact (1 to 10)
2. Negative speech (scolding, threats) = negative impact (-1 to -10)
3. Stronger emotions = stronger impact
4. Cat reactions must be realistic

Return only the JSON object, no additional text or formatting.`,
        },
        { role: "user", content: speech },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    console.log("🤖 Raw LLM Response:", response.choices[0].message.content);

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from LLM");
    }

    // Clean up the response if needed
    const cleanContent = content
      .replace(/```json\n?/, "")
      .replace(/```\n?/, "")
      .trim();

    try {
      const analysis = JSON.parse(cleanContent);

      // Validate the response
      if (
        typeof analysis.moodImpact !== "number" ||
        !["positive", "negative", "neutral"].includes(analysis.sentiment) ||
        typeof analysis.catReaction !== "string"
      ) {
        throw new Error("Invalid response format from LLM");
      }

      return analysis;
    } catch (parseError) {
      console.error("Parse error:", parseError);
      console.error("Content that failed to parse:", cleanContent);
      throw new Error("Failed to parse LLM response");
    }
  } catch (error) {
    console.error("🚨 LLM Analysis failed:", error);
    // Return a fallback response instead of throwing
    return {
      moodImpact: 0,
      sentiment: "neutral",
      catReaction: "The cat seems unsure how to react.",
    };
  }
}
