// backend/seeders/YYYYMMDDHHMMSS-create-superadmin.js
import bcrypt from 'bcryptjs';

export default {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'Super Admin',
        email: 'admin@ladicare.com',
        password: passwordHash,
        role: 'superAdmin',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', { email: 'admin@ladicare.com' });
  },
};
