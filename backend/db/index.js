// backend/db/index.js - Sequelize models
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ladicare',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'Rich@2014.com',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// CATEGORY MODEL
const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true, len: [2, 100] },
  },
  description: { type: DataTypes.TEXT, allowNull: true },
  slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (category) => {
      if (!category.slug && category.name) {
        category.slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
    },
    beforeUpdate: (category) => {
      if (category.changed('name')) {
        category.slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
    },
  },
});

// PRODUCT MODEL
const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  original_price: { type: DataTypes.FLOAT, allowNull: true },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  sku: { type: DataTypes.STRING(50), allowNull: true, unique: true },
  images: { type: DataTypes.JSONB, defaultValue: [] },
  videos: { type: DataTypes.JSONB, defaultValue: [] },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  rejection_reason: { type: DataTypes.TEXT },
  stock_quantity: { type: DataTypes.INTEGER, allowNull: false },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  weight: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
  dimensions: { type: DataTypes.JSONB, allowNull: true },
  tags: { type: DataTypes.JSONB, defaultValue: [] },
  meta_title: { type: DataTypes.STRING(160), allowNull: true },
  meta_description: { type: DataTypes.STRING(320), allowNull: true },
  slug: { type: DataTypes.STRING(250), allowNull: false, unique: true },
  vendorId: { type: DataTypes.STRING, allowNull: false },
  thumbnail: { type: DataTypes.STRING, allowNull: false },
  earnings: { type: DataTypes.FLOAT, defaultValue: 0 },
}, {
  tableName: 'products',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (product) => {
      if (!product.slug && product.name) {
        product.slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      if (!product.sku) {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        product.sku = `LC-${timestamp.slice(-6)}-${random}`;
      }
    },
    beforeUpdate: (product) => {
      if (product.changed('name')) {
        product.slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
    },
  },
});

const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  session_id: { type: DataTypes.STRING, allowNull: true },
  customer_id: { type: DataTypes.INTEGER, allowNull: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  variant_id: { type: DataTypes.INTEGER, allowNull: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
}, {
  tableName: 'cart_items',
  timestamps: true,
  underscored: true,
});

const AdminLog = sequelize.define('AdminLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  action: { type: DataTypes.STRING(100), allowNull: false },
  resource_type: { type: DataTypes.STRING(100), allowNull: false },
  resource_id: { type: DataTypes.INTEGER, allowNull: true },
  details: { type: DataTypes.JSONB, allowNull: true },
  user_agent: { type: DataTypes.TEXT, allowNull: true },
  ip_address: { type: DataTypes.INET, allowNull: true },
}, {
  tableName: 'admin_logs',
  timestamps: true,
  underscored: true,
});

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  customer_info: { type: DataTypes.JSONB, allowNull: false },
  products: { type: DataTypes.JSONB, allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (order) => {
      if (!order.order_number) {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        order.order_number = `ORD-${timestamp.slice(-8)}-${random}`;
      }
    }
  }
});

const ProductVariant = sequelize.define('ProductVariant', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  sku: { type: DataTypes.STRING, allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  attributes: { type: DataTypes.JSONB, allowNull: true, defaultValue: {} },
}, {
  tableName: 'product_variants',
  timestamps: true,
  underscored: true,
});

ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  customer_id: { type: DataTypes.INTEGER, allowNull: true },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'reviews',
  timestamps: true,
  underscored: true,
});

const FooterContent = sequelize.define('FooterContent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  socialLinks: {
    type: DataTypes.JSONB,
    field: 'social_links',
    defaultValue: []
  },
  quickLinks: {
    type: DataTypes.JSONB,
    field: 'quick_links',
    defaultValue: []
  },
  serviceLinks: {
    type: DataTypes.JSONB,
    field: 'service_links',
    defaultValue: []
  },
  copyright: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
}, {
  tableName: 'footer_contents',
  timestamps: true,
  underscored: true,
});

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('superAdmin', 'admin', 'customer'), defaultValue: 'customer' },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// relationships
Review.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });

Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

Order.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });


const connectDatabase = async () => {
  await sequelize.authenticate();
  console.log('Database connected ✅');
};

const initializeDatabase = async () => {
  await connectDatabase();
  await sequelize.sync({ alter: false });
};

export {
  sequelize,
  Product,
  Category,
  connectDatabase,
  initializeDatabase,
  AdminLog,
  Order,
  Review,
  FooterContent,
  User,
  ProductVariant,
  CartItem
};
