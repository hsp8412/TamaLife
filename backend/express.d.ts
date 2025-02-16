// backend/express.d.ts
import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      _id: string;
      // add any other properties your user object contains
    };
  }
}
