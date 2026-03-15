import { NextResponse } from 'next/server';
import { otpStore, cleanupExpiredOtps } from '../otpStore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, otp } = body;

        if (!email || !otp) {
            return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
        }

        cleanupExpiredOtps();
        const record = otpStore.get(email);

        if (!record) {
            return NextResponse.json({
                success: false,
                message: "No OTP request found for this email. Please request a new code.",
            }, { status: 400 });
        }

        if (Date.now() > record.expiresAt) {
            otpStore.delete(email);
            return NextResponse.json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            }, { status: 400 });
        }

        // Verify the code
        if (record.otp === otp) {
            // Valid, delete single-use code
            otpStore.delete(email);
            return NextResponse.json({
                success: true,
                message: "OTP verified successfully",
            }, { status: 200 });
        } else {
            return NextResponse.json({
                success: false,
                message: "Invalid OTP",
            }, { status: 400 });
        }
    } catch (error) {
        console.error("verify-otp error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
