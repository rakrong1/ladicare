export async function up(queryInterface, Sequelize) {
  return queryInterface.bulkInsert(
    'categories',
    [
      {
        id: 1,
        name: 'Skincare',
        slug: 'skincare',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'Makeup',
        slug: 'makeup',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: 'Haircare',
        slug: 'haircare',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    { ignoreDuplicates: true } // ✅ skip existing
  );
}

export async function down(queryInterface) {
  return queryInterface.bulkDelete('categories', {
    name: ['Skincare', 'Makeup', 'Haircare']
  });
}
