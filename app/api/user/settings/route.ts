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
    } catch (_error) {
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
        language: "English (United States)",
        user: {
            name: "Alex Doe",
            email: "alex.doe@workzup.com",
            phone: "+1 (555) 000-0000",
            location: "San Francisco, CA",
            birthday: "1992-05-15",
            title: "Product Designer",
            bio: "Passionate about creating seamless user experiences and connecting talent with great opportunities.",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&h=250&auto=format&fit=crop"
        },
        ratings: {
            overallRating: 4.8,
            workQualities: {
                reliability: 4.9,
                technicalSkill: 4.7,
                communication: 4.8,
                punctuality: 5.0
            },
            pastExperiences: [
                { id: 1, company: "TechCorp", role: "Junior Dev", rating: 5.0, feedback: "Exceptional work quality." },
                { id: 2, company: "DesignHub", role: "UI Designer", rating: 4.6, feedback: "Great eye for detail." }
            ]
        }
    });
}
