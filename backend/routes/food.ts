import { Router, Request, Response } from 'express';
import { singleFoodUpload, processFoodFile } from '../repos/foodRepo'; 
// adjust path if needed

const router = Router();

// POST /food
router.post('/', singleFoodUpload, (req: Request, res: Response) => {
  try {
    // Multer has already processed the file at this point
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Perform any post-processing logic
    const result = processFoodFile(req.file);

    // Send result back to the client
    return res.json(result);

  } catch (error) {
    console.error('Error in /food route:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
