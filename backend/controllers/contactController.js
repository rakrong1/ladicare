// backend/controllers/contactController.js
import ContactMessage from '../models/contactmessage.js'; // adjust path if needed
import { sendContactAlert } from '../utils/mailer.js';

export const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const saved = await ContactMessage.create({ name, email, subject, message });

    // ✅ Send Email Notification
    await sendContactAlert({ name, email, subject, message });

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Save to DB (optional)
    await ContactMessage.create({ name, email, subject, message });

    res.status(200).json({ message: 'Your message has been received. Thank you!' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};
