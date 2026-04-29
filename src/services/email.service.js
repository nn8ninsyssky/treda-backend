const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: '74.125.200.108', // Gmail SMTP IPv4 (critical fix)
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendEmail = async ({ to, subject, text }) => {
  try {
    await transporter.sendMail({
      from: `"TREDA Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("📧 Email sent to:", to);
  } catch (err) {
    console.error("Email failed:", err.message);
  }
};

module.exports = { sendEmail };