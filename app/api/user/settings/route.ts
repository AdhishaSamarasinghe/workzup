import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Simulate some logic
        console.log("Updating settings:", body);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        return NextResponse.json({
            success: true,
            message: "Settings updated successfully",
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Failed to update settings" },
            { status: 400 }
        );
    }
}

export async function GET() {
    // Simulate fetching current settings
    return NextResponse.json({
        profileVisibility: true,
        newJobMatches: true,
        applicationUpdates: true,
        marketingEmails: false,
        securityEmails: true,
        twoFactorEnabled: false,
        theme: "light",
        user: {
            name: "Alex Doe",
            email: "alex.doe@workzup.com",
            phone: "+1 (555) 000-0000",
            location: "San Francisco, CA",
            birthday: "1992-05-15",
            title: "Product Designer",
            bio: "Passionate about creating seamless user experiences and connecting talent with great opportunities.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
        },
        billing: {
            plan: "Pro Plan",
            nextBillingDate: "2026-03-09",
            status: "active"
        }
    });
}
