import type { ReactNode } from "react";
import "./globals.css";
import HeaderWrapper from "../components/HeaderWrapper";
import Footer from "../components/Footer";
import MainContentWrapper from "../components/MainContentWrapper";
import AuthProvider from "./components/AuthProvider";
import AutoRefresh from "../components/AutoRefresh";

export const metadata = {
  title: "Workzup",
  description: "Workzup job board",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-[#111827] antialiased">
        <AuthProvider>
          <AutoRefresh interval={3000} />
          <div className="flex min-h-screen flex-col">
            <HeaderWrapper />
            <MainContentWrapper>{children}</MainContentWrapper>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
