export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('products', 'thumbnail', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('products', 'thumbnail');
}
