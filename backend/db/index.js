import { Sequelize, DataTypes, Op } from 'sequelize';
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

// ─── Models ─────────────────────────────────────────────

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true, validate: { notEmpty: true, len: [2, 100] } },
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

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  original_price: { type: DataTypes.FLOAT },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  sku: { type: DataTypes.STRING(50), allowNull: true, unique: true },
  images: { type: DataTypes.JSONB, defaultValue: [] },
  videos: { type: DataTypes.JSONB, defaultValue: [] },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  rejection_reason: { type: DataTypes.TEXT },
  stock_quantity: { type: DataTypes.INTEGER, allowNull: false },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  weight: { type: DataTypes.DECIMAL(8, 2) },
  dimensions: { type: DataTypes.JSONB },
  tags: { type: DataTypes.JSONB, defaultValue: [] },
  meta_title: { type: DataTypes.STRING(160) },
  meta_description: { type: DataTypes.STRING(320) },
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
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  session_id: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  customer_id: { 
    type: DataTypes.UUID, 
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  product_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  variant_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: {
      model: 'product_variants',
      key: 'id'
    }
  },
  quantity: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  price: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  }
}, {
  tableName: 'cart_items',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['customer_id', 'product_id', 'variant_id'],
      unique: true,
      where: {
        customer_id: {
          [Op.ne]: null
        }
      }
    },
    {
      fields: ['session_id', 'product_id', 'variant_id'],
      unique: true,
      where: {
        session_id: {
          [Op.ne]: null
        }
      }
    }
  ],
  validate: {
    cartOwner() {
      if (!this.session_id && !this.customer_id) {
        throw new Error('Either session_id or customer_id is required');
      }
    }
  }
});
const AdminLog = sequelize.define('AdminLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  action: { type: DataTypes.STRING(100), allowNull: false },
  resource_type: { type: DataTypes.STRING(100), allowNull: false },
  resource_id: { type: DataTypes.INTEGER },
  details: { type: DataTypes.JSONB },
  user_agent: { type: DataTypes.TEXT },
  ip_address: { type: DataTypes.INET },
}, {
  tableName: 'admin_logs',
  timestamps: true,
  underscored: true,
});
const Order = sequelize.define('Order', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  order_number: { 
    type: DataTypes.STRING(50), 
    allowNull: false, 
    unique: true 
  },
  user_id: { 
    type: DataTypes.UUID,  // Changed from INTEGER to UUID to match User.id
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customer_info: { 
    type: DataTypes.JSONB, 
    allowNull: false 
  },
  products: { 
    type: DataTypes.JSONB, 
    allowNull: false 
  },
  subtotal: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  }
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
  sku: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  attributes: { type: DataTypes.JSONB, defaultValue: {} },
}, {
  tableName: 'product_variants',
  timestamps: true,
  underscored: true,
});

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  customer_id: { type: DataTypes.INTEGER },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
}, {
  tableName: 'reviews',
  timestamps: true,
  underscored: true,
});

const FooterContent = sequelize.define('FooterContent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  socialLinks: { type: DataTypes.JSONB, field: 'social_links', defaultValue: [] },
  quickLinks: { type: DataTypes.JSONB, field: 'quick_links', defaultValue: [] },
  serviceLinks: { type: DataTypes.JSONB, field: 'service_links', defaultValue: [] },
  copyright: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
}, {
  tableName: 'footer_contents',
  timestamps: true,
  underscored: true,
});
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('superAdmin', 'admin', 'customer'), defaultValue: 'customer' },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
});

// ─── Relationships ──────────────────────────────────────

Review.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });

Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

Order.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
User.hasMany(Order, { 
  foreignKey: 'user_id', 
  as: 'orders',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });

CartItem.belongsTo(User, { 
  foreignKey: 'customer_id', 
  as: 'user',
  onDelete: 'CASCADE'
 });
User.hasMany(CartItem, { foreignKey: 'customer_id', as: 'cartItems' });

// Add to Relationships section
CartItem.belongsTo(Product, { 
  foreignKey: 'product_id', 
  as: 'product',
  onDelete: 'CASCADE'
});
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });

CartItem.belongsTo(ProductVariant, { 
  foreignKey: 'variant_id', 
  as: 'variant',
  onDelete: 'CASCADE'
});
ProductVariant.hasMany(CartItem, { foreignKey: 'variant_id', as: 'cartItems' });
// ─── Database Setup ─────────────────────────────────────

const connectDatabase = async () => {
  await sequelize.authenticate();
  console.log('✅ Database connected');
};

const initializeDatabase = async () => {
  await connectDatabase();
  await sequelize.sync({ alter: false }); // Back to normal sync mode
};

// ─── Exports ─────────────────────────────────────────────

export {
  sequelize,
  initializeDatabase,
  connectDatabase,
  Product,
  Category,
  Order,
  Review,
  FooterContent,
  User,
  AdminLog,
  CartItem,
  ProductVariant
};
