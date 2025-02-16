import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Express } from 'express';  // for type definitions

// 1. Configure the storage destination for uploaded files

const __dirname = path.resolve();
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    // Construct path to the ml/uploads folder
    console.log(__dirname);
    const uploadPath = path.join(__dirname, '/ml/uploads');
    // Ensure folder exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (_req, file, cb) {
    // Optional unique suffix to avoid collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// 2. Create a Multer instance using the above storage config
const upload = multer({ storage });

// 3. Export the single file upload middleware
//    This can be used in your route: app.post(..., singleFoodUpload, ...)
export const singleFoodUpload = upload.single('photo');

// 4. Example: Additional processing or business logic
//    Called AFTER multer has saved the file
export function processFoodFile(file: Express.Multer.File) {
  // Here you could do any additional logic, such as:
  // - log to a database
  // - call an AI model
  // - rename the file further
  // - etc.

  // We'll just return a simple message here
  return {
    message: 'Image received and saved successfully!',
    filename: file.filename,
    path: file.path
  };
}
