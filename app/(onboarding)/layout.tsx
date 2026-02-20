import React from "react";
import OnboardingTransition from "@/components/OnboardingTransition";

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <OnboardingTransition>
            {children}
        </OnboardingTransition>
    );
}
