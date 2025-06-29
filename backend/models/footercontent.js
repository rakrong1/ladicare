import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const FooterContent = sequelize.define('FooterContent', {
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  social_links: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  quick_links: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  service_links: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  copyright: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active',
  },
}, {
  tableName: 'footer_contents',
  timestamps: true,
  underscored: true, // maps camelCase to snake_case columns
});

export default FooterContent;
