// backend/tests/llm-test.ts
import dotenv from "dotenv";
dotenv.config();

import { analyzePetInteraction } from "../services/llmService.js";

async function testLLM() {
  console.log("🔍 Testing LLM Service...");
  console.log("API Key present:", !!process.env.DEEPSEEK_API_KEY);

  const tests = [
    {
      type: "Positive",
      speech:
        "You're such a good kitty! I love you so much! You're the best cat ever!",
    },
    {
      type: "Negative",
      speech: "Bad cat! Get out of here! I don't want you around anymore!",
    },
    {
      type: "Neutral",
      speech: "Hey cat, what are you doing over there?",
    },
  ];

  for (const test of tests) {
    console.log(`\n🗣 Testing ${test.type} Speech:`);
    console.log("Input:", test.speech);

    try {
      const result = await analyzePetInteraction(test.speech);
      console.log("✅ Analysis Result:");
      console.log("Mood Impact:", result.moodImpact);
      console.log("Sentiment:", result.sentiment);
      console.log("Cat Reaction:", result.catReaction);
    } catch (error) {
      console.error("❌ Test Failed:", error);
      if (error instanceof Error) {
        console.error("Error Details:", error.message);
        console.error("Stack:", error.stack);
      }
    }
  }
}

console.log("🚀 Starting LLM Tests");
testLLM()
  .then(() => console.log("\n✨ Tests Completed"))
  .catch((error) => console.error("❌ Test Suite Failed:", error));
