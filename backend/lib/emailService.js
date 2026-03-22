const nodemailer = require('nodemailer');
const { loadEnv, getEnv } = require('../config/env');

loadEnv();

const emailUser = getEnv('EMAIL_USER') || getEnv('SMTP_USER');
const emailPass = getEnv('EMAIL_PASS') || getEnv('SMTP_PASS');

if (!emailUser || !emailPass) {
  console.error(
    'Email configuration error: EMAIL_USER and EMAIL_PASS are required (SMTP_USER/SMTP_PASS are accepted as legacy fallbacks).',
  );
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

const sendOTP = async (to, otp, isPasswordReset = false) => {
  const subject = isPasswordReset ? 'Your Password Reset Code' : 'Your Email Verification Code';
  const purpose = isPasswordReset ? 'reset your password' : 'verify your new email address';
  
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Workzup" <noreply@workzup.com>',
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Workzup Security</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333333; margin-top: 0;">Hello,</p>
          <p style="font-size: 16px; color: #333333;">Please use the verification code below to ${purpose}:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 4px; color: #4F46E5; background-color: #F3F4F6; padding: 15px 30px; border-radius: 8px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666666;">This code will expire in 10 minutes. If you did not request this code, please ignore this email and secure your account.</p>
        </div>
        <div style="background-color: #F9FAFB; padding: 15px; text-align: center; font-size: 12px; color: #9CA3AF;">
          &copy; ${new Date().getFullYear()} Workzup. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendOTP
};
