import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productsRouter from "./routes/products.js";
import uploadRouter from "./routes/upload.js";
import authRouter from "./routes/auth.js";

dotenv.config();
const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//Routes
app.get("/", (req, res) => {
  res.send("API is running");
});
app.use("/api/products", productsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/auth", authRouter);

//Static Files
app.use("/uploads", express.static("uploads"));

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
