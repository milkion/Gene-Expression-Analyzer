import jwt from "jsonwebtoken";
import { Request } from "express";

export interface AuthContext {
  userId?: string;
}

export const authenticateUser = (req: Request): AuthContext => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return {}; // No auth header means user is not authenticated
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
  if (!token) {
    return {}; // If there's no token, return an empty object (unauthenticated)
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return { userId: decoded.userId }; // Attach userId to the context
  } catch (error) {
    console.error("JWT Verification Failed:", error);
    return {}; // Invalid token case
  }
};
