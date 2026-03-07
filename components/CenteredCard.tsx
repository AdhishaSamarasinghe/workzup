import React, { type ReactNode } from "react";

interface CenteredCardProps {
  children: ReactNode;
  className?: string;
}

export default function CenteredCard({
  children,
  className = "",
}: CenteredCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div
        className={`w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
