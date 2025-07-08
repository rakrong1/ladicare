import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { Product, Category, Review, ProductVariant } from '../db/index.js';
import handleError from '../utils/errorHandler.js';

// ✅ GET /api/products - with optional filters
export const getProducts = async (req, res) => {
  try {
    const { sellerId, status, is_featured, category } = req.query;
    const where = {};

    if (sellerId) where.sellerId = sellerId;
    if (status) where.status = status;
    if (is_featured !== undefined) where.is_featured = is_featured === 'true';
    if (category) where.category_id = category;

    const products = await Product.findAll({
      where,
      include: [{ model: Category, as: 'category' }]
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// ✅ GET /api/products/id/:id - Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductVariant, as: 'variants' },
        { model: Review, as: 'reviews' }
      ]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const tags = Array.isArray(product.tags) ? product.tags : JSON.parse(product.tags || '[]');
    const images = Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]');
    const videos = Array.isArray(product.videos) ? product.videos : JSON.parse(product.videos || '[]');

    const reviews = product.reviews || [];
    const avgRating = reviews.length
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2))
      : 0;

    const formattedVariants = (product.variants || []).map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: parseFloat(v.price),
      quantity: parseInt(v.quantity),
      attributes: typeof v.attributes === 'string'
        ? JSON.parse(v.attributes)
        : v.attributes || {}
    }));

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: parseFloat(product.price),
        original_price: parseFloat(product.original_price || product.price),
        stock_quantity: product.stock_quantity,
        features: product.features || [],
        reviewCount: reviews.length,
        rating: avgRating,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name,
              slug: product.category.slug
            }
          : null,
        tags,
        images,
        videos,
        variants: formattedVariants,
        status: product.status,
        thumbnail: product.thumbnail,
        createdAt: product.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    handleError(res, error, 'Failed to fetch product');
  }
};

// ✅ POST /api/products
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      original_price,
      stock_quantity,
      category_id,
      sellerId,
      tags,
      features
    } = req.body;

    const thumbnail = req.file ? req.file.filename : null;

    if (!name || !description || !price || !thumbnail || !category_id) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slug = `${slugBase}-${uuidv4().slice(0, 8)}`;

    const newProduct = await Product.create({
      name,
      description,
      price,
      original_price: original_price || price,
      stock_quantity: Number.isNaN(parseInt(stock_quantity)) ? 0 : parseInt(stock_quantity),
      category_id,
      thumbnail,
      slug,
      vendorId: sellerId || 1,
      sellerId: sellerId || null,
      tags: Array.isArray(tags) ? tags : JSON.parse(tags || '[]'),
      features: Array.isArray(features) ? features : JSON.parse(features || '[]'),
      status: 'pending'
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(400).json({ error: 'Failed to create product' });
  }
};

// ✅ PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (req.file) {
      if (product.thumbnail) {
        const oldPath = path.join('uploads', product.thumbnail);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      req.body.thumbnail = req.file.filename;
    }

    if (req.body.stock) req.body.stock_quantity = req.body.stock;
    if (!req.body.original_price) req.body.original_price = req.body.price;
    if (req.body.category_id) req.body.category_id = parseInt(req.body.category_id);

    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = JSON.parse(req.body.tags);
    }
    if (req.body.features && typeof req.body.features === 'string') {
      req.body.features = JSON.parse(req.body.features);
    }

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ error: 'Failed to update product' });
  }
};

// ✅ DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.thumbnail) {
      const filePath = path.join('uploads', product.thumbnail);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
