const express = require("express");
const router = express.Router();
const { Resend } = require("resend");

// POST /api/auth/send-otp-resend
router.post("/send-otp-resend", async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedOtp = String(otp || "").trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!normalizedOtp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const data = await resend.emails.send({
      from: process.env.SMTP_FROM || 'Workzup <noreply@workzup.com>',
      to: normalizedEmail,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${normalizedOtp}`,
      html: `<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;\"><div style=\"background-color: #4F46E5; padding: 20px; text-align: center;\"><h1 style=\"color: #ffffff; margin: 0; font-size: 24px;\">Workzup Security</h1></div><div style=\"padding: 30px; background-color: #ffffff;\"><p style=\"font-size: 16px; color: #333333; margin-top: 0;\">Hello,</p><p style=\"font-size: 16px; color: #333333;\">Please use the verification code below to verify your new email address:</p><div style=\"text-align: center; margin: 30px 0;\"><span style=\"font-size: 36px; font-weight: bold; letter-spacing: 4px; color: #4F46E5; background-color: #F3F4F6; padding: 15px 30px; border-radius: 8px;\">${normalizedOtp}</span></div><p style=\"font-size: 14px; color: #666666;\">This code will expire in 10 minutes. If you did not request this code, please ignore this email and secure your account.</p></div><div style=\"background-color: #F9FAFB; padding: 15px; text-align: center; font-size: 12px; color: #9CA3AF;\">&copy; ${new Date().getFullYear()} Workzup. All rights reserved.</div></div>`
    });
    console.log("[Resend] OTP email sent:", data);
    res.json({ success: true, message: "OTP email sent via Resend" });
  } catch (err) {
    console.error("[Resend] Failed to send OTP:", err);
    res.status(500).json({ message: "Failed to send OTP email via Resend" });
  }
});

module.exports = router;
