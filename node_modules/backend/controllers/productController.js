import Product from "../models/Product.js";

// Approve a product (for superadmin)
export const approveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all products (admin view)
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find(); // All products, approved or not
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products (you can filter for approved products here)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ approved: true }); // Only approved products
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new product (default to not approved)
export const createProduct = async (req, res) => {
  try {
    const { name, price, image } = req.body;
    const product = new Product({ name, price, image, approved: false });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
