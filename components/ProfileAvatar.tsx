"use client";

import { useState } from "react";
import Image from "next/image";
import { getNameInitials } from "@/lib/profile";

type ProfileAvatarProps = {
  src?: string | null;
  name?: string;
  size: number;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
};

export default function ProfileAvatar({
  src,
  name,
  size,
  className = "",
  imageClassName = "",
  textClassName = "",
}: ProfileAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const initials = getNameInitials(name);

  if (src && src !== failedSrc) {
    return (
      <Image
        key={src}
        src={src}
        alt={name || "Profile avatar"}
        width={size}
        height={size}
        className={imageClassName || "h-full w-full object-cover transition-opacity duration-300"}
        onError={() => setFailedSrc(src)}
        unoptimized
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6b8bff] to-[#8fb3ff] text-white ${className}`}
      aria-label={name || "Profile avatar"}
    >
      <span className={`font-bold uppercase ${textClassName}`}>
        {initials}
      </span>
    </div>
  );
}
