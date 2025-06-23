export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Products', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },

    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },

    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    price: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },

    stock: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },

    thumbnail: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    status: {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },

    sellerId: {
      type: Sequelize.INTEGER,
      allowNull: true, // Can be used later for auth
    },

    earnings: {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    },

    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },

    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Products');
}
