import type { ReactNode } from "react";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthProvider from "./components/AuthProvider";

export const metadata = {
  title: "Workzup",
  description: "Workzup job board",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-[#111827] antialiased">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
