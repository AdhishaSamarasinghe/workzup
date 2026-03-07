import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, otp } = body;

        if (!email || !otp) {
            return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
        }

        // Mock OTP verification (static 123456)
        if (otp === "123456") {
            console.log(`[Mock Verify] OTP verified for ${email}`);
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
