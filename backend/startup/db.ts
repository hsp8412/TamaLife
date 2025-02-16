import mongoose from "mongoose";

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("MONGODB_URI is not defined.");
  process.exit(1);
}

export async function connectToMongo() {
  try {
    await mongoose.connect(uri || "");
    console.log("Connected to MongoDB using Mongoose");
  } catch (err) {
    console.error("Error connecting to MongoDB with Mongoose:", err);
  }
}
