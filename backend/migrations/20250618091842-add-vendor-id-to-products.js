export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('products', 'vendor_id', {
    type: Sequelize.INTEGER,
    allowNull: true
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('products', 'vendor_id');
}
