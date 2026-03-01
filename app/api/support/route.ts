import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, message } = body;

        // Basic validation
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Name, email, and message are required fields." },
                { status: 400 }
            );
        }

        // Email validation regex (simple)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        // In a real application, you would save this to a database,
        // send an email to your support team, or forward to a service like Zendesk/Intercom.

        // For now, we'll just log it and simulate a successful response
        console.log("New Support Request Received:");
        console.log(`- Name: ${name}`);
        console.log(`- Email: ${email}`);
        console.log(`- Message: ${message}`);

        // Simulate slight network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return NextResponse.json(
            { message: "Support request received successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing support request:", error);
        return NextResponse.json(
            { error: "An internal server error occurred while processing your request." },
            { status: 500 }
        );
    }
}
