// backend/models/Product.js
import slugify from 'slugify';
import { pool } from '../db/index.js';

// --- Standalone Helpers ---

export const getApprovedProducts = async () => {
  const result = await pool.query(
    'SELECT * FROM products WHERE status = $1 ORDER BY created_at DESC',
    ['approved']
  );
  return result.rows.map(row => new Product(row));
};

export const createProduct = async (product) => {
  const {
    name, description, price, comparePrice = null,
    categoryId, images = [], videos = [], quantity = 0
  } = product;

  const slug = slugify(name, { lower: true, strict: true });

  const result = await pool.query(`
    INSERT INTO products (
      name, slug, description, price, compare_price,
      category_id, images, videos, quantity, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
    RETURNING *`,
    [name, slug, description, price, comparePrice, categoryId, JSON.stringify(images), JSON.stringify(videos), quantity]
  );

  return new Product(result.rows[0]);
};

export class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.shortDescription = data.short_description;
    this.price = parseFloat(data.price);
    this.comparePrice = data.compare_price ? parseFloat(data.compare_price) : null;
    this.sku = data.sku;
    this.quantity = parseInt(data.quantity);
    this.categoryId = data.category_id;
    this.tags = data.tags || [];
    this.images = Array.isArray(data.images) ? data.images : JSON.parse(data.images || '[]');
    this.videos = Array.isArray(data.videos) ? data.videos : JSON.parse(data.videos || '[]');
    this.status = data.status;
    this.visibility = data.visibility;
    this.featured = data.featured;
    this.reviewedBy = data.reviewed_by;
    this.reviewedAt = data.reviewed_at;
    this.adminNotes = data.admin_notes;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // --- Static Methods ---

  static async findById(id) {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return new Product(result.rows[0]);
  }

  static async findByStatus(status) {
    const result = await pool.query('SELECT * FROM products WHERE status = $1 ORDER BY created_at DESC', [status]);
    return result.rows.map(row => new Product(row));
  }

  static async findFeatured(limit = 10) {
    const result = await pool.query(
      'SELECT * FROM products WHERE status = $1 AND featured = true ORDER BY created_at DESC LIMIT $2',
      ['approved', limit]
    );
    return result.rows.map(row => new Product(row));
  }

  // --- Instance Methods ---

  async save() {
    const result = await pool.query(`
      UPDATE products SET
        name = $1,
        slug = $2,
        description = $3,
        price = $4,
        compare_price = $5,
        category_id = $6,
        quantity = $7,
        images = $8,
        videos = $9,
        status = $10,
        reviewed_by = $11,
        reviewed_at = $12,
        admin_notes = $13,
        updated_at = NOW()
      WHERE id = $14
      RETURNING *`,
      [
        this.name,
        this.slug || slugify(this.name, { lower: true, strict: true }),
        this.description,
        this.price,
        this.comparePrice,
        this.categoryId,
        this.quantity,
        JSON.stringify(this.images),
        JSON.stringify(this.videos),
        this.status,
        this.reviewedBy,
        this.reviewedAt,
        this.adminNotes,
        this.id
      ]
    );

    Object.assign(this, result.rows[0]);
    return this;
  }

  async approve(adminId) {
    this.status = 'approved';
    this.reviewedBy = adminId;
    this.reviewedAt = new Date();
    return await this.save();
  }

  async reject(adminId, notes) {
    this.status = 'rejected';
    this.adminNotes = notes;
    this.reviewedBy = adminId;
    this.reviewedAt = new Date();
    return await this.save();
  }

  // --- Getters ---

  get isOnSale() {
    return this.comparePrice && this.comparePrice > this.price;
  }

  get discountPercentage() {
    if (!this.isOnSale) return 0;
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }

  get inStock() {
    return this.quantity > 0;
  }
}
