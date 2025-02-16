import { Router, Request, Response } from "express";
import { singleFoodUpload, processFoodFile } from "../repos/foodRepo.js";

const router = Router();

// POST /food
router.post("/", singleFoodUpload, (req: Request, res: Response) => {
  try {
    console.log("Received request with file:", req.file);

    if (!req.file) {
      console.log("No file in request");
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Process the uploaded file
    console.log("Processing file...");
    console.log("File size:", req.file.size);
    console.log("File path:", req.file);
    const processedFile = processFoodFile(req.file);
    console.log("Processed file result:", processedFile);

    return res.json(processedFile);
  } catch (error) {
    console.error("Error in /food route:", error);
    return res.status(500).json({
      error: "Internal server error.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
