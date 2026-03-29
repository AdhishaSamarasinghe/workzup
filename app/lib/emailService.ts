import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTP = async (to: string, otp: string) => {
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to Workzup!</h1>
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <p style="font-size: 16px; color: #333333; margin-top: 0;">Hello,</p>
        <p style="font-size: 16px; color: #333333;">Thank you for registering. Please use the verification code below to complete your sign-up process:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 4px; color: #4F46E5; background-color: #F3F4F6; padding: 15px 30px; border-radius: 8px;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #666666;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
      </div>
      <div style="background-color: #F9FAFB; padding: 15px; text-align: center; font-size: 12px; color: #9CA3AF;">
        &copy; ${new Date().getFullYear()} Workzup. All rights reserved.
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: from,
      to,
      subject: 'Your Registration OTP',
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email with Resend:', error);
      return false;
    }

    console.log('Message sent:', data);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
