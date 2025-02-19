import { User } from "./../models/user";
import cron from "node-cron";
// import User from "../models/user";

// Schedule a cron job to run every minute
const startCronJobs = () => {
  cron.schedule("* * * * *", async () => {
    try {
      // Update neutral → sad
      const neutralToSad = await User.updateMany(
        { mood: "neutral" },
        { $set: { mood: "sad" } }
      );
      console.log(
        `Updated ${neutralToSad.modifiedCount} users from neutral to sad.`
      );
      // Update happy → neutral
      const happyToNeutral = await User.updateMany(
        { mood: "happy" },
        { $set: { mood: "neutral" } }
      );
      console.log(
        `Updated ${happyToNeutral.modifiedCount} users from happy to neutral.`
      );
    } catch (error) {
      console.error("Error updating user moods:", error);
    }
  });

  cron.schedule("* * * * *", async () => {
    try {
      const result = await User.updateMany(
        { healthPoints: { $gt: 0 } }, // Only decrement if value is greater than 0
        { $inc: { healthPoints: -1 } } // Decrement by 1
      );
      console.log(
        `Decrement operation applied to ${result.modifiedCount} documents.`
      );
    } catch (error) {
      console.error("Error updating documents:", error);
    }
  });
};

export default startCronJobs;
