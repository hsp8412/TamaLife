import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  // Try to get token from cookies first (for web clients)
  let token = req.cookies?.jwt_token;

  // If not found, check Authorization header (for React Native)
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]; // Extract token from Bearer scheme
    }
  }

  if (!token) {
    return res.status(401).json({error: "Access denied. No token provided."});
  }

  const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;
  if (!jwtPrivateKey) {
    return res.status(500).json({error: "JWT private key is not defined."});
  }

  try {
    const decoded = jwt.verify(token, jwtPrivateKey);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({error: "Invalid token."});
  }
};
