/* eslint-disable import/prefer-default-export */
// controllers/footerController.js
import FooterContent from '../models/footercontent.js';

export const getFooter = async (req, res) => {
  try {
    const footer = await FooterContent.findOne({
      where: { status: 'active' },
    });

    if (!footer) {
      return res.status(404).json({ message: 'Footer content not found' });
    }

    // Return camelCase keys for frontend consistency
    res.json({
      data: {
        description: footer.description,
        socialLinks: footer.social_links || [],
        quickLinks: footer.quick_links || [],
        serviceLinks: footer.service_links || [],
        copyright: footer.copyright,
      },
    });
  } catch (error) {
    console.error('❌ Failed to fetch footer content:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
