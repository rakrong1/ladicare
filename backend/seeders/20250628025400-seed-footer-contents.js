'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert('footer_contents', [
    {
      description: 'Your beauty destination for natural care.',
      social_links: JSON.stringify([
        { name: 'Facebook', url: 'https://facebook.com/ladicare', icon: '📘' },
        { name: 'Instagram', url: 'https://instagram.com/ladicare', icon: '📸' }
      ]),
      quick_links: JSON.stringify([
        { label: 'Home', href: '/' },
        { label: 'Shop', href: '/products' },
        { label: 'Contact', href: '/contact' }
      ]),
      service_links: JSON.stringify([
        { label: 'FAQs', href: '/faq' },
        { label: 'Returns', href: '/returns' },
        { label: 'Shipping', href: '/shipping' }
      ]),
      copyright: '© 2025 Ladicare. All rights reserved.',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('footer_contents', null, {});
}
