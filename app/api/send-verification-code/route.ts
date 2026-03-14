import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateSixDigitCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = typeof body?.email === "string" ? body.email.trim() : "";

        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email is required",
                },
                { status: 400 }
            );
        }

        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email format",
                },
                { status: 400 }
            );
        }

        const code = generateSixDigitCode();

        // Temporary testing behavior: no real email provider yet.
        console.log(`[send-verification-code] Mock send to ${email}: ${code}`);

        return NextResponse.json(
            {
                success: true,
                message: "Verification code sent successfully",
                code,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("send-verification-code error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}
