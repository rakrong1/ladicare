// models/footercontent.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js '; // your Sequelize instance

const FooterContent = sequelize.define('FooterContent', {
  description: DataTypes.TEXT,
  socialLinks: DataTypes.JSON,
  quickLinks: DataTypes.JSON,
  serviceLinks: DataTypes.JSON,
  copyright: DataTypes.STRING,
  status: DataTypes.STRING,
}, {
  tableName: 'footer_contents', // ensure matches table name in DB
  timestamps: true,
});

export default FooterContent;
