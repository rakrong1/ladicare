export async function up(queryInterface) {
  await queryInterface.bulkInsert('footer_contents', [
    {
      description: 'Your premier destination for luxury beauty and skincare products.',
      socialLinks: JSON.stringify([
        { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
        { name: 'Instagram', url: 'https://instagram.com', icon: '📷' },
        { name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
      ]),
      quickLinks: JSON.stringify([
        { label: 'All Products', href: '/products' },
        { label: 'Skincare', href: '/products?category=skincare' },
        { label: 'Makeup', href: '/products?category=makeup' },
        { label: 'About Us', href: '/about' },
      ]),
      serviceLinks: JSON.stringify([
        { label: 'Contact Us', href: '/contact' },
        { label: 'Shipping Info', href: '#' },
        { label: 'Returns', href: '#' },
        { label: 'FAQ', href: '#' },
      ]),
      copyright: '© 2024 Ladicare. All rights reserved. Made with ❤️ for beauty enthusiasts.',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('footer_contents', null, {});
}
