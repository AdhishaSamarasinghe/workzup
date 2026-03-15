export interface OtpRecord {
  otp: string;
  expiresAt: number;
}

// In-memory store for OTPs during the registration flow
// Key: email address
export const otpStore = new Map<string, OtpRecord>();

// Helper to clean up expired OTPs periodically (optional but good practice)
export const cleanupExpiredOtps = () => {
  const now = Date.now();
  for (const [email, record] of Array.from(otpStore.entries())) {
    if (now > record.expiresAt) {
      otpStore.delete(email);
    }
  }
};
