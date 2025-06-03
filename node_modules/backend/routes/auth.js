import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  getAllProductsAdmin,
  approveProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ error: "Username taken" });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    password: hashed,
    role: role || "admin",
  });
  res.status(201).json({ message: "User created" });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  res.json({
    token,
    username: user.username,
    role: user.role, // <-- Make sure this is included!
    userId: user._id, // <-- And this!
  });
});

router.get("/all", authenticate, requireRole("admin"), getAllProductsAdmin);
router.put(
  "/:id/approve",
  authenticate,
  requireRole("superadmin"),
  approveProduct
);

export default router;
