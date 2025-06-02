import express from "express";
import {
  getAllProducts,
  createProduct,
  getAllProductsAdmin,
} from "../controllers/productController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllProducts);
router.post("/", createProduct);
router.get("/all", authenticate, requireRole("admin"), getAllProductsAdmin);

export default router;
