import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, mode, type } = body;

        // This is a mock authentication logic
        // In a real application, you would:
        // 1. Validate the input
        // 2. Hash the password (for registration)
        // 3. Check the database (for login)
        // 4. Create a session (JWT or cookie)

        console.log(`Auth attempt: ${mode} for ${type} - ${email}`);

        // Simulate a short delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Basic validation
        if (!email || !password) {
            return NextResponse.json(
                { message: "Missing email or password" },
                { status: 400 }
            );
        }

        // Success response
        return NextResponse.json(
            {
                message: mode === "login" ? "Login successful" : "Account created successfully",
                user: {
                    email,
                    role: type,
                    name: email.split("@")[0],
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
