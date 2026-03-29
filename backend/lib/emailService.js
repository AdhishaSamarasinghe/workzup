const { Resend } = require('resend');
const { loadEnv, getEnv } = require('../config/env');

loadEnv();

const resendApiKey = getEnv('RESEND_API_KEY');
const resendFromEmail = getEnv('RESEND_FROM_EMAIL', 'onboarding@resend.dev');

let resend;
if (resendApiKey) {
  resend = new Resend(resendApiKey);
} else {
  console.error('RESEND_API_KEY is missing. Emails will not be sent.');
}

const sendOTP = async (to, otp, isPasswordReset = false) => {
  if (!resend) {
    console.error('OTP email send skipped: RESEND_API_KEY is missing.');
    return false;
  }

  const subject = isPasswordReset ? 'Your Password Reset Code' : 'Your Email Verification Code';
  const purpose = isPasswordReset ? 'reset your password' : 'verify your new email address';
  
  const htmlContent = `
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
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: resendFromEmail,
      to,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email with Resend:', error);
      return false;
    }

    console.log('Message sent:', data);
    return true;
  } catch (error) {
    console.error('Error sending email:', error?.message || error);
    return false;
  }
};

module.exports = {
  sendOTP
};
