import {User} from "../models/user";

export const getStates = async (req, res) => {
  const userId = process.env.DEMO_USER_ID;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({error: "User not found."});
  return res.status(200).json({HP: user.healthPoints, mood: user.mood});
};
