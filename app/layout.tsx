import type { ReactNode } from "react";
import "./globals.css";
import AppShell from "../components/AppShell";

export const metadata = {
  title: "Workzup",
  description: "Workzup job board",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-[#111827] antialiased" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
