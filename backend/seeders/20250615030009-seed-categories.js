// backend/seeders/XXXXXXXXXXXXXX-seed-categories.js

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert('Categories', [
    {
      name: 'Skincare',
      description: 'Products for healthy skin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Makeup',
      description: 'Cosmetics and beauty enhancers',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Haircare',
      description: 'Hair treatments and conditioners',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('Categories', null, {});
}
