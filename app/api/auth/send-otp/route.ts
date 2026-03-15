import { NextResponse } from 'next/server';
import { sendOTP } from '../../../lib/emailService';
import { otpStore, cleanupExpiredOtps } from '../otpStore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        // Clean up expired OTPs to avoid memory leaks
        cleanupExpiredOtps();

        // Generate a 6-digit random code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to store (expires in 10 minutes)
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000
        });

        // Send OTP via email
        const emailSent = await sendOTP(email, otp);

        if (!emailSent) {
             return NextResponse.json({ message: "Failed to send OTP email" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "OTP sent successfully",
        }, { status: 200 });

    } catch (error) {
        console.error("send-otp error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
