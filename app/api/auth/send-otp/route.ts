import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        // Mock sending an OTP email (static 123456)
        console.log(`[Mock SMS/Email] Sending OTP 123456 to ${email}`);

        return NextResponse.json({
            success: true,
            message: "OTP sent successfully",
        }, { status: 200 });

    } catch (error) {
        console.error("send-otp error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
