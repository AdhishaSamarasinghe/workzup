/**
 * layout.tsx — Root layout for the entire Next.js app
 *
 * Wraps every page with:
 *  - Global CSS (globals.css)
 *  - Sticky Header (navbar + logo + user avatar)
 *  - Footer
 *
 * Used by: all pages under /app
 * Key exports: RootLayout (default)
 */

// ─── Imports ──────────────────────────────────────────────────────────────────
import type { ReactNode } from "react";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ─── Metadata ─────────────────────────────────────────────────────────────────
// [UI] Next.js metadata — sets <title> and <meta name="description"> for all pages
export const metadata = {
  title: "Workzup",
  description: "Workzup job board",
};

type RootLayoutProps = {
  children: ReactNode;
};

// ─── Layout ───────────────────────────────────────────────────────────────────
// [UI] Flex column layout ensures the footer stays at the bottom even on short pages
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-[#111827] antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
