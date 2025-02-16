// backend/routes/pet.ts
import express, { Request, Response } from "express";
import { analyzePetInteraction } from "../services/llmService";
import { User } from "../models/user";

const router = express.Router();

const DEMO_USER_ID = process.env.DEMO_USER_ID;

const getDemoUser = async () => {
  let user = await User.findById(DEMO_USER_ID);
  if (!user) {
    // Create demo user if none exists
    user = await User.create({
      _id: DEMO_USER_ID, // Use the specific ID
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      password: "demo123", // In a real app, this should be hashed
      petName: "Kitty",
      healthPoints: 100,
      mood: "neutral",
    });
  }
  return user;
};

router.post("/interact", (req: Request, res: Response) => {
  (async () => {
    try {
      const { speech } = req.body;
      if (!speech) {
        return res.status(400).json({ error: "Speech content is required" });
      }

      // Analyze speech with LLM
      const analysis = await analyzePetInteraction(speech);

      // Get demo user
      const user = await getDemoUser();

      // Calculate new health points
      const newHP = Math.max(
        0,
        Math.min(100, user.healthPoints + analysis.moodImpact)
      );

      // Determine new mood based on health points
      let newMood: "happy" | "sad" | "neutral";
      if (newHP >= 70) {
        newMood = "happy";
      } else if (newHP <= 30) {
        newMood = "sad";
      } else {
        newMood = "neutral";
      }

      // Update user's pet state
      await User.findByIdAndUpdate(user._id, {
        healthPoints: newHP,
        mood: newMood,
      });

      // Return response
      return res.json({
        petState: {
          healthPoints: newHP,
          mood: newMood,
          petName: user.petName,
        },
        analysis,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to process pet interaction",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  })();
});

router.get("/state", (req: Request, res: Response) => {
  (async () => {
    try {
      const user = await getDemoUser();

      return res.json({
        petName: user.petName,
        healthPoints: user.healthPoints,
        mood: user.mood,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to get pet state",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  })();
});

export default router;
