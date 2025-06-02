import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js"; // Import authRouter
import dotenv from "dotenv";
import uploadRouter from "./routes/upload.js"; // Import uploadRouter

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API is running");
});

// MongoDB connection
const MONGO_URI = "mongodb://localhost:27017/hair-product-store";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter); // Use authRouter for authentication routes
app.use("/api/upload", uploadRouter); // Use uploadRouter for file uploads

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
