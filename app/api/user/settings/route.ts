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
        applicationUpdates: false,
        user: {
            name: "Alex Doe",
            email: "alex.doe@workzup.com",
            title: "Product Designer",
            bio: "Passionate about creating seamless user experiences and connecting talent with great opportunities.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
        }
    });
}
