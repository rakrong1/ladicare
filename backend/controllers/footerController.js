import FooterContent from '../models/footercontent.js';

export const getFooter = async (req, res) => {
  try {
    const footer = await FooterContent.findOne({ where: { status: 'active' } });

    if (!footer) {
      return res.status(404).json({ message: 'Footer content not found' });
    }

    res.json(footer);
  } catch (error) {
    console.error('Failed to fetch footer content:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
