// backend/tests/llm-pet-test.js
import fetch from "node-fetch";

const positiveSpeeches = [
  {
    description: "Loving and affectionate",
    speech:
      "You're the most precious kitty in the world! I love you so much and I'll always take care of you. You make me so happy every single day!",
  },
  {
    description: "Praising good behavior",
    speech:
      "What a good kitty you are! You're so well-behaved and gentle. I'm so proud of how you always use your scratching post!",
  },
  {
    description: "Gentle and soothing",
    speech:
      "Hey sweet baby, you're such a calm and beautiful cat. Your purring makes me feel so peaceful and loved.",
  },
];

const negativeSpeeches = [
  {
    description: "Harsh scolding",
    speech:
      "You're such a terrible cat! I can't believe you knocked everything off the table again! I regret getting you!",
  },
  {
    description: "Threatening",
    speech:
      "If you don't stop scratching the furniture, I'm going to get rid of you! You're the worst pet ever!",
  },
  {
    description: "Cold and dismissive",
    speech:
      "Just go away, I don't want you around. You're nothing but trouble and I wish I never got a cat.",
  },
];

async function testPetInteractions() {
  const baseUrl = "http://localhost:4000/api/pet";

  try {
    // Initial state
    console.log("\n📊 Getting initial state...");
    const stateRes = await fetch(`${baseUrl}/state`);
    const initialState = await stateRes.json();
    console.log("Initial state:", initialState);

    // Test positive interactions
    console.log("\n💚 Testing Positive Interactions 💚");
    for (const test of positiveSpeeches) {
      console.log(`\n🗣 Testing: ${test.description}`);
      const res = await fetch(`${baseUrl}/interact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speech: test.speech }),
      });
      const result = await res.json();
      console.log("Response:", result);
      console.log("Mood Impact:", result.analysis.moodImpact);
      console.log("Cat's Reaction:", result.analysis.catReaction);

      // Wait between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Get intermediate state
    console.log("\n📊 Checking state after positive interactions...");
    const midStateRes = await fetch(`${baseUrl}/state`);
    const midState = await midStateRes.json();
    console.log("Current state:", midState);

    // Test negative interactions
    console.log("\n❤️‍🩹 Testing Negative Interactions ❤️‍🩹");
    for (const test of negativeSpeeches) {
      console.log(`\n🗣 Testing: ${test.description}`);
      const res = await fetch(`${baseUrl}/interact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speech: test.speech }),
      });
      const result = await res.json();
      console.log("Response:", result);
      console.log("Mood Impact:", result.analysis.moodImpact);
      console.log("Cat's Reaction:", result.analysis.catReaction);

      // Wait between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Get final state
    console.log("\n📊 Getting final state...");
    const finalStateRes = await fetch(`${baseUrl}/state`);
    const finalState = await finalStateRes.json();
    console.log("Final state:", finalState);

    // Print summary
    console.log("\n📝 Test Summary");
    console.log("Initial Health Points:", initialState.healthPoints);
    console.log("Final Health Points:", finalState.healthPoints);
    console.log(
      "Total Mood Change:",
      finalState.healthPoints - initialState.healthPoints
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", await error.response.text());
    }
  }
}

console.log("🐱 Starting Cat Interaction Tests 🐱");
testPetInteractions().then(() => {
  console.log("\n✅ Tests completed");
});
