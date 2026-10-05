import User from "../models/User.js";
import { verifyToken } from "../services/authService.js";

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const claims = verifyToken(token);
  if (!claims) return res.status(401).json({ message: "Please sign in to continue." });
  try {
    const user = await User.findOne({ _id: claims.sub, active: true });
    if (!user) return res.status(401).json({ message: "This account is unavailable." });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this resource." });
    }
    next();
  };
}
