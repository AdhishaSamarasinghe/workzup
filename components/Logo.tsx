import Link from "next/link";
import React from "react";

interface LogoProps {
    className?: string;
    textSize?: string;
}

export default function Logo({ className = "", textSize = "text-3xl" }: LogoProps) {
    return (
        <Link href="/" className={`inline-block select-none ${className}`}>
            <span className={`${textSize} font-extrabold tracking-tight leading-none`}>
                <span className="bg-gradient-to-r from-[#5ee7df] to-[#6B8BFF] bg-clip-text text-transparent pb-1">
                    Workz
                </span>
                <span className="text-black">up</span>
            </span>
        </Link>
    );
}
