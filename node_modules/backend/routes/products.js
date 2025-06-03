import express from "express";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";
const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ approved: true }); // Only approved
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Add a product
router.post("/", async (req, res) => {
  try {
    const { name, price, image, userId } = req.body;
    const product = new Product({ name, price, image, user: userId });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: "Failed to add product" });
  }
});

// Update a product
router.put("/:id", async (req, res) => {
  try {
    const { name, price, image } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, image },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: "Failed to update product" });
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: "Failed to delete product" });
  }
});

// Get products by user
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Valid userId param is required" });
  }
  try {
    const products = await Product.find({ user: userId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user's products" });
  }
});

// Get user info and their products
router.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Valid userId param is required" });
  }
  try {
    const user = await User.findById(userId).select("username");
    if (!user) return res.status(404).json({ error: "User not found" });
    const products = await Product.find({ user: userId });
    res.json({ user, products });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

export default router;
