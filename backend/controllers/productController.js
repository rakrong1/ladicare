import { Product, Category, Review, ProductVariant } from '../db/index.js';
import { handleError } from '../utils/errorHandler.js';

// eslint-disable-next-line import/prefer-default-export
export async function getProductById(req, res) {
  const { id } = req.params;

  try {
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

    // Parse safe fields
    const tags = Array.isArray(product.tags) ? product.tags : JSON.parse(product.tags || '[]');
    const images = Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]');
    const videos = Array.isArray(product.videos) ? product.videos : JSON.parse(product.videos || '[]');

    // Average rating
    const reviews = product.reviews || [];
    const avgRating = reviews.length
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2))
      : 0;

    const formattedVariants = (product.variants || []).map(v => ({
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
        shortDescription: product.short_description,
        price: parseFloat(product.price),
        comparePrice: product.compare_price ? parseFloat(product.compare_price) : null,
        sku: product.sku,
        quantity: parseInt(product.quantity),
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug
        } : null,
        tags,
        images,
        videos,
        variants: formattedVariants,
        status: product.status,
        featured: product.featured,
        rating: {
          average: avgRating,
          count: reviews.length
        },
        createdAt: product.created_at
      }
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch product');
  }
}
