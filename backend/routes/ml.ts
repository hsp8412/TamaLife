// backend/routes/ml.ts
import express, { Request, Response } from "express";
import { spawn } from "child_process";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import fsSync from "fs"; // Add this import for synchronous file operations

// Types
interface ClassificationResult {
  category: string;
  confidence: number;
  all_probabilities: {
    [key: string]: number;
  };
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

interface ModelMetadata {
  version: string;
  size: number;
  lastModified: string;
  inputShape: number[];
  labels: string[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Multer configuration
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG and PNG are allowed."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

const router = express.Router();

// Serve TFLite model
router.get("/model", async (req: Request, res: Response) => {
  const modelPath = path.join(__dirname, "../ml/model/model_latest.tflite");

  try {
    // Check if file exists
    const exists = await fs
      .access(modelPath)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      console.error("Model file not found at:", modelPath);
      return res.status(404).json({ error: "Model file not found" });
    }

    // Get file stats
    const stats = await fs.stat(modelPath);
    console.log("Serving model file:", {
      path: modelPath,
      size: stats.size,
    });

    // Set appropriate headers
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", stats.size);
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=model_latest.tflite"
    );

    // Create read stream using synchronous fs
    const fileStream = fsSync.createReadStream(modelPath);

    // Handle stream errors
    fileStream.on("error", (error) => {
      console.error("Stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Failed to stream model",
          details: error.message,
        });
      }
    });

    // Pipe the file to response
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error serving model:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to serve model",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

// Get model metadata
router.get("/model/metadata", async (req: Request, res: Response) => {
  const modelPath = path.join(__dirname, "../ml/model/model_latest.tflite");

  try {
    const stats = await fs.stat(modelPath);
    const metadata: ModelMetadata = {
      version: "1.0.0",
      size: stats.size,
      lastModified: stats.mtime.toISOString(),
      inputShape: [1, 224, 224, 3],
      labels: ["non_food", "food", "junk_food"],
    };

    res.json(metadata);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get model metadata",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Your existing predict endpoint for server-side processing
router.post(
  "/predict",
  upload.single("image"),
  async (
    req: Request,
    res: Response<ClassificationResult | ErrorResponse>
  ): Promise<void> => {
    console.log("Received prediction request");

    if (!req.file) {
      console.log("No file received in request");
      res.status(400).json({ error: "No image provided" });
      return;
    }

    console.log("Received file:", {
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    try {
      const scriptPath = path.join(__dirname, "../ml/src/api.py");
      console.log("Python script path:", scriptPath);

      const result = await runPythonScript(scriptPath, [req.file.path]);
      console.log("Python script result:", result);

      const classification: ClassificationResult = JSON.parse(result);
      res.json(classification);
    } catch (error) {
      console.error("Classification error:", error);
      res.status(500).json({
        error: "Classification failed",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      if (req.file) {
        await cleanupFile(req.file.path);
      }
    }
  }
);

const runPythonScript = async (
  scriptPath: string,
  args: string[] = []
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log("Running Python script:", {
      scriptPath,
      args,
      cwd: process.cwd(),
    });

    const pythonCommand = process.platform === "darwin" ? "python3" : "python";
    const pythonProcess = spawn(pythonCommand, [scriptPath, ...args], {
      cwd: process.cwd(),
    });

    let result = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      console.log("Python stdout:", output);
      // Only append if it looks like JSON
      if (output.trim().startsWith("{")) {
        result = output.trim();
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      const error = data.toString();
      console.error("Python stderr:", error);
      errorOutput += error;
    });

    pythonProcess.on("close", (code) => {
      console.log("Python process closed with code:", code);

      if (code === 0 && result) {
        try {
          // Verify it's valid JSON
          JSON.parse(result);
          resolve(result);
        } catch (e) {
          reject(new Error(`Invalid JSON output: ${result}`));
        }
      } else {
        reject(
          new Error(
            `Python script failed with code ${code}: ${errorOutput || result}`
          )
        );
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Process spawn error:", error);
      reject(error);
    });
  });
};

// Cleanup function
const cleanupFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Failed to cleanup file ${filePath}:`, error);
  }
};

export default router;
