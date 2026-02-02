import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Workzup",
  description: "Workzup job board",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-[#111827] antialiased">
        {children}
      </body>
    </html>
  );
}
