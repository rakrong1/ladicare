export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('footer_contents', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    social_links: {
      type: Sequelize.JSON,
      allowNull: true
    },
    quick_links: {
      type: Sequelize.JSON,
      allowNull: true
    },
    service_links: {
      type: Sequelize.JSON,
      allowNull: true
    },
    copyright: {
      type: Sequelize.STRING,
      allowNull: true
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'active'
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false
    }
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('footer_contents');
}
