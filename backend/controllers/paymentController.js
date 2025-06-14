// backend/controllers/paymentController.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export const initializePayment = async (req, res) => {
  try {
    const { email, amount } = req.body;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Paystack expects amount in kobo (NGN cents)
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json({ authorization_url: response.data.data.authorization_url });
  } catch (err) {
    console.error('Paystack Init Error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Payment initialization failed.' });
  }
};

export const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    return res.status(200).json({ status: response.data.data.status });
  } catch (err) {
    console.error('Paystack Verification Error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Payment verification failed.' });
  }
};
