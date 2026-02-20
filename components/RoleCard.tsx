import React from "react";

interface RoleCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}

export default function RoleCard({
    title,
    description,
    icon,
    onClick,
    disabled = false,
}: RoleCardProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-blue-50">
                {icon}
            </div>
            <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </button>
    );
}
