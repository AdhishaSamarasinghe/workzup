"use client";

import { useState, useEffect } from "react";
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
  const [imgError, setImgError] = useState(false);
  const initials = getNameInitials(name);

  // Reset error state if src changes
  useEffect(() => {
    setImgError(false);
  }, [src]);

  if (src && !imgError) {
    return (
      <Image
        src={src}
        alt={name || "Profile avatar"}
        width={size}
        height={size}
        className={imageClassName || "h-full w-full object-cover transition-opacity duration-300"}
        onError={() => setImgError(true)}
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
