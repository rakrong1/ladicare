import { Category, Product } from '../db/index.js';
// eslint-disable-next-line import/order
import { Sequelize } from 'sequelize';

// eslint-disable-next-line import/prefer-default-export
export const getCategories = async (req, res) => {
  try {
    const { active, name } = req.query;

    const where = {};
    if (active !== undefined) where.is_active = active === 'true';
    if (name) where.name = name;

    const categories = await Category.findAll({
      where,
      attributes: {
        include: [
          // 👇 Add COUNT of products in each category
          [Sequelize.fn('COUNT', Sequelize.col('products.id')), 'productCount']
        ]
      },
      include: [{
        model: Product,
        as: 'products',
        attributes: [] // Just counting, not retrieving full product rows
      }],
      group: ['Category.id'],
      order: [['name', 'ASC']]
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
