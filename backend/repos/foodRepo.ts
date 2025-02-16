import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { fileURLToPath } from "url";

// Types
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// Fix for __dirname in ES modules
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);

// Create uploads directory path
const uploadPath = path.join(currentDirPath, "..", "ml", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log(`Created uploads directory at: ${uploadPath}`);
}

const storage = multer.diskStorage({
  destination: function (
    _req: Request,
    _file: MulterFile,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, uploadPath);
  },
  filename: function (
    _req: Request,
    file: MulterFile,
    cb: (error: Error | null, filename: string) => void
  ) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Add file filter for images
const fileFilter = (
  _req: Request,
  file: MulterFile,
  cb: FileFilterCallback
) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG and PNG are allowed."));
  }
};

// Create multer instance with configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 5MB limit
  },
});

export const singleFoodUpload = upload.single("photo");

export async function processFoodFile(file: MulterFile) {
  const result = await fetch("http://localhost:4000/api/ml/classify", {
    method: "POST",
    body: JSON.stringify({
      argument: file.path
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await result.json();

  return {
    data
  };
}
