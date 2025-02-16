// backend/tests/pet-test.js
import fetch from "node-fetch";

async function testPetInteractions() {
  const baseUrl = "http://localhost:4000/api/pet";

  try {
    // Test 1: Get initial state
    console.log("\nTest 1: Getting initial state...");
    const stateRes = await fetch(`${baseUrl}/state`);
    const initialState = await stateRes.json();
    console.log("Initial state:", initialState);

    // Test 2: Positive interaction
    console.log("\nTest 2: Testing positive interaction...");
    const positiveRes = await fetch(`${baseUrl}/interact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        speech: "You're the most amazing cat ever! I love you so much!",
      }),
    });
    const positiveResult = await positiveRes.json();
    console.log("Positive interaction result:", positiveResult);

    // Test 3: Negative interaction
    console.log("\nTest 3: Testing negative interaction...");
    const negativeRes = await fetch(`${baseUrl}/interact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        speech: "Bad cat! Stop making such a mess!",
      }),
    });
    const negativeResult = await negativeRes.json();
    console.log("Negative interaction result:", negativeResult);

    // Test 4: Get final state
    console.log("\nTest 4: Getting final state...");
    const finalStateRes = await fetch(`${baseUrl}/state`);
    const finalState = await finalStateRes.json();
    console.log("Final state:", finalState);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testPetInteractions();
