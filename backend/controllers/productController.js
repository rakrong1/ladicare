// backend/controllers/productController.js
import { v4 as uuidv4 } from 'uuid';
import { Product, Category, Review, ProductVariant } from '../db/index.js';
import handleError from '../utils/errorHandler.js';
// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { sellerId, status } = req.query;
    const where = {};

    if (sellerId) where.sellerId = sellerId;
    if (status) where.status = status; // Optional filtering

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, as: 'category' }
      ]
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// POST /api/products
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      original_price,
      stock,
      category_id,
      sellerId,
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
      original_price: original_price || price, // fallback
      stock_quantity: stock,
      category_id,
      thumbnail,
      slug, // ✅ guaranteed unique
      vendorId: sellerId || 1,
      sellerId: sellerId || null,
      status: 'pending',
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(400).json({ error: 'Failed to create product' });
  }
};


// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (req.body.stock) {
  req.body.stock_quantity = req.body.stock;
}
if (!req.body.original_price) {
  req.body.original_price = req.body.price;
}


    if (req.file) req.body.thumbnail = req.file.filename;
    if (req.body.category_id) req.body.category_id = parseInt(req.body.category_id);

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ error: 'Failed to update product' });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// GET /api/products/:id
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
        rating: {
          average: avgRating,
          count: reviews.length
        },
        createdAt: product.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    handleError(res, error, 'Failed to fetch product');
  }
};
