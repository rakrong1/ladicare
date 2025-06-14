export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('footer_contents', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    description: {
      type: Sequelize.TEXT,
    },
    socialLinks: {
      type: Sequelize.JSON,
    },
    quickLinks: {
      type: Sequelize.JSON,
    },
    serviceLinks: {
      type: Sequelize.JSON,
    },
    copyright: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: 'active',
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('footer_contents');
}
