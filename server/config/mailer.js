const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (to, token) => {
  const verifyLink = `http://localhost:5173/verify/${token}`;

  await transporter.sendMail({
    from: `"PFE Hub" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Confirm your PFE Hub account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to PFE Hub!</h2>
        <p>Please confirm your account by clicking the button below:</p>
        <a href="${verifyLink}"
           style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Confirm my account
        </a>
       
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail };
