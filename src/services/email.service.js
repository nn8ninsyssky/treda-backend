const axios = require('axios');

const sendEmail = async ({ to, subject, text }) => {
  try {
    const res = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: "TREDA Support",
          email: process.env.EMAIL_USER
        },
        to: [{ email: to }],
        subject: subject,
        textContent: text
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("📧 Email sent:", to, res.data.messageId);

  } catch (err) {
    console.error("❌ Email failed:", err.response?.data || err.message);
  }
};

module.exports = { sendEmail };