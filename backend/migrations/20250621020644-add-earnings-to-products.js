// migrations/XXXXXXXXXXXXXX-add-earnings-to-products.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('products', 'earnings', {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('products', 'earnings');
}
