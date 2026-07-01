const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify().then(() => {
  console.log('[emailService] SMTP connection verified');
}).catch(err => {
  console.error('[emailService] SMTP verification failed:', err.message);
});

const sendVerificationCodeEmail = async (to, code) => {
  const mailOptions = {
    from: `"NAJAH" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your NAJAH verification code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; padding: 24px 0;">
          <h1 style="color: #0084D1; margin: 0;">NAJAH</h1>
        </div>
        <div style="background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 20px;">Welcome to NAJAH!</h2>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
            Use the code below to verify your email address.
          </p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #0084D1; font-family: monospace;">
              ${code}
            </span>
          </div>
          <p style="color: #9ca3af; font-size: 13px; margin: 16px 0 0 0;">
            This code expires in 10 minutes.
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          If you did not create an account, you can ignore this email.
        </p>
      </div>`,
  };
  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (to, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const mailOptions = {
    from: `"NAJAH" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your NAJAH password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0084D1;">Password Reset Request</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}"
           style="display: inline-block; padding: 12px 24px; background: #0084D1; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Reset my password
        </a>
        <p style="margin-top: 24px; color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>`,
  };
  await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (to, token) => {
  const verifyLink = `${process.env.CLIENT_URL}/verify/${token}`;
  const mailOptions = {
    from: `"NAJAH" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Confirm your NAJAH account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0084D1;">Welcome to NAJAH!</h2>
        <p>Please confirm your account by clicking the button below:</p>
        <a href="${verifyLink}"
           style="display: inline-block; padding: 12px 24px; background: #0084D1; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Confirm my account
        </a>
      </div>`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationCodeEmail, sendPasswordResetEmail, sendVerificationEmail };
