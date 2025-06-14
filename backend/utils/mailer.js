import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use smtp: 'smtp.mailtrap.io', etc.
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendContactAlert = async ({ name, email, subject, message }) => {
  await transporter.sendMail({
    from: `<${process.env.SMTP_USER}>`,
    to: process.env.ALERT_RECEIVER, // e.g. admin@ladicare.com
    subject: `📬  ${subject}`,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });
};
