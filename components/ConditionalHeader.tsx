"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ConditionalHeader() {
  const pathname = usePathname();

  if (typeof pathname === "string" && pathname.startsWith("/preferences")) {
    return null;
  }

  return <Header />;
}
