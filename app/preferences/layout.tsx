import type { ReactNode } from "react";
import "../globals.css";
import Footer from "@/components/Footer";
import SkillsHeader from "@/components/skills/Header";

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
      <body className="min-h-screen bg-bg text-[#111827] antialiased">
        <div className="flex min-h-screen flex-col">
          <SkillsHeader />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
