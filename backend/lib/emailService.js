const nodemailer = require('nodemailer');
const { loadEnv, getEnv } = require('../config/env');

loadEnv();

const emailUser = getEnv('EMAIL_USER') || getEnv('SMTP_USER');
const emailPass = getEnv('EMAIL_PASS') || getEnv('SMTP_PASS');
const smtpHost = getEnv('SMTP_HOST', 'smtp.gmail.com');
const smtpPort = Number.parseInt(getEnv('SMTP_PORT', '587'), 10);
const smtpFrom = getEnv('SMTP_FROM', '"Workzup" <noreply@workzup.com>');

if (!emailUser || !emailPass) {
  console.error(
    'Email configuration error: EMAIL_USER and EMAIL_PASS are required (SMTP_USER/SMTP_PASS are accepted as legacy fallbacks).',
  );
}

function buildTransport(strategy) {
  if (strategy.type === 'service') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }

  return nodemailer.createTransport({
    host: strategy.host,
    port: strategy.port,
    secure: strategy.secure,
    requireTLS: !strategy.secure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    // Railway environments can hit transient IPv6 route delays; prefer IPv4.
    name: 'workzup.lk',
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

function getTransportStrategies() {
  const strategies = [];

  if (smtpHost) {
    strategies.push({
      type: 'host',
      host: smtpHost,
      port: Number.isFinite(smtpPort) ? smtpPort : 587,
      secure: (Number.isFinite(smtpPort) ? smtpPort : 587) === 465,
      label: `host:${smtpHost}:${Number.isFinite(smtpPort) ? smtpPort : 587}`,
    });
  }

  const lowerHost = String(smtpHost || '').toLowerCase();
  const hostLooksLikeGmail = !lowerHost || lowerHost.includes('gmail');

  if (hostLooksLikeGmail) {
    strategies.push({
      type: 'host',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      label: 'gmail:465:ssl',
    });

    strategies.push({
      type: 'host',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      label: 'gmail:587:starttls',
    });

    strategies.push({
      type: 'service',
      label: 'gmail:service',
    });
  }

  const seen = new Set();
  return strategies.filter((item) => {
    const key = `${item.type}:${item.host || ''}:${item.port || ''}:${item.secure || false}:${item.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const sendOTP = async (to, otp, isPasswordReset = false) => {
  if (!emailUser || !emailPass) {
    console.error('OTP email send skipped: SMTP credentials are missing.');
    return false;
  }

  const subject = isPasswordReset ? 'Your Password Reset Code' : 'Your Email Verification Code';
  const purpose = isPasswordReset ? 'reset your password' : 'verify your new email address';
  
  const mailOptions = {
    from: smtpFrom,
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

  const strategies = getTransportStrategies();
  let lastError = null;

  for (const strategy of strategies) {
    try {
      const transporter = buildTransport(strategy);
      const info = await transporter.sendMail(mailOptions);
      console.log(`Message sent via ${strategy.label}: %s`, info.messageId);
      return true;
    } catch (error) {
      lastError = error;
      console.error(`Error sending email via ${strategy.label}:`, error?.message || error);
    }
  }

  console.error('Error sending email: all SMTP strategies failed.', lastError?.message || lastError);
  return false;
};

module.exports = {
  sendOTP
};
