import User from "../models/User.js";
import { createToken, hashPassword, verifyPassword } from "../services/authService.js";

const publicUser = (user) => ({ _id: user._id, name: user.name, email: user.email, role: user.role });

export async function login(req, res, next) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const user = await User.findOne({ email, active: true }).select("+passwordHash");
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }
    res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function registerStudent(req, res, next) {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !emailPattern.test(email) || password.length < 10) {
      return res.status(400).json({ message: "Name, a valid email address, and a password of at least 10 characters are required." });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists. Try signing in instead." });
    }
    const user = await User.create({ name, email, role: "student", passwordHash: await hashPassword(password) });
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function me(req, res) { res.json({ user: publicUser(req.user) }); }
