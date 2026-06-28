const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (to, token) => {
  const verifyLink = `${process.env.CLIENT_URL}/verify/${token}`;
  console.log(`[sendEmail] Sending verification email to ${to}...`);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Confirm your NAJAH account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to NAJAH!</h2>
        <p>Please confirm your account by clicking the button below:</p>
        <a href="${verifyLink}"
           style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Confirm my account
        </a>
      </div>
    `,
  });

  console.log(`[sendEmail] Verification email sent to ${to}`);
};

const sendPasswordResetEmail = async (to, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  console.log(`[sendEmail] Sending password reset email to ${to}...`);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Reset your NAJAH password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Password Reset Request</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}"
           style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Reset my password
        </a>
        <p style="margin-top: 24px; color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });

  console.log(`[sendEmail] Password reset email sent to ${to}`);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
