"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ConditionalHeader() {
  const pathname = usePathname();

  if (typeof pathname === "string" && pathname.startsWith("/preferences")) {
    return null;
  }

  if (
    typeof pathname === "string" &&
    pathname.startsWith("/recruiterprofile")
  ) {
    return null;
  }

  return <Header />;
}
