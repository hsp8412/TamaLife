import express, { Request, Response } from "express";
import { spawn } from "child_process";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs/promises";

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

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration with file filtering and size limits
const storage = multer.diskStorage({
  destination: "uploads/",
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
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const router = express.Router();

// Helper function to run Python script
const runPythonScript = async (
  scriptPath: string,
  args: string[] = []
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [scriptPath, ...args]);
    let result = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve(result);
      } else {
        reject(
          new Error(`Python script failed with code ${code}: ${errorOutput}`)
        );
      }
    });

    pythonProcess.on("error", (error) => {
      reject(error);
    });
  });
};

// Cleanup function for uploaded files
const cleanupFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Failed to cleanup file ${filePath}:`, error);
  }
};

// Routes
router.post(
  "/predict",
  upload.single("image"),
  async (
    req: Request,
    res: Response<ClassificationResult | ErrorResponse>
  ): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No image provided" });
      return;
    }

    try {
      const result = await runPythonScript(
        path.join(__dirname, "../ml/src/api.py"),
        [req.file.path]
      );

      const classification: ClassificationResult = JSON.parse(result);
      res.json(classification);
    } catch (error) {
      console.error("Classification error:", error);
      res.status(500).json({
        error: "Classification failed",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      // Cleanup uploaded file
      if (req.file) {
        await cleanupFile(req.file.path);
      }
    }
  }
);

router.get(
  "/training-info",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await runPythonScript(
        path.join(__dirname, "../ml/src/test_api.py")
      );

      const info = JSON.parse(result);
      res.json(info);
    } catch (error) {
      console.error("Training info error:", error);
      res.status(500).json({
        error: "Could not get training info",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

// Error handling middleware
router.use(
  (error: Error, req: Request, res: Response, next: express.NextFunction) => {
    console.error("ML Router Error:", error);

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res
          .status(400)
          .json({ error: "File size is too large. Maximum size is 5MB." });
      } else {
        res.status(400).json({ error: error.message });
      }
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
