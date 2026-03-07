import type { ReactNode } from "react";
import "./globals.css";

import AuthProvider from "./components/AuthProvider";

export const metadata = {
  title: "Workzup",
  description: "Workzup job board",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-[#111827] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
