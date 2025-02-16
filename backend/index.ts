import dotenv from "dotenv";
dotenv.config();

import {connectToMongo} from "./startup/db.js";
import express from "express";
import setupRoutes from "./startup/routes.js";
import cors from "cors";
import startCronJobs from "./cron/cronJob.js";

console.log(process.env.MONGO_URI);
console.log(process.env.FRONTEND_URL);
console.log(process.env.PORT);

const app = express();
const port = process.env.PORT || 4000;

// Enable CORS for frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

// Connect to MongoDB
// connectToMongo();
app.use(express.json());

// Setup Routes
setupRoutes(app);

// Default Route
app.get("/", (req, res) => {
  res.send(`Hello, World!`);
});

// Start the Server
app.listen(port, () => {
  connectToMongo();
  startCronJobs();
  console.log(`Server is running on http://localhost:${port}`);
});
