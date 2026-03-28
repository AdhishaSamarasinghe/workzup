import type { ReactNode } from "react";
import "./globals.css";
import HeaderWrapper from "../components/HeaderWrapper";
import Footer from "../components/Footer";
import MainContentWrapper from "../components/MainContentWrapper";
import AuthProvider from "./components/AuthProvider";
import AutoRefresh from "../components/AutoRefresh";
import { MessageNotificationProvider } from "@/lib/messaging/NotificationContext";
import { ApplicationNotificationProvider } from "./components/ApplicationNotificationProvider";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Workzup",
  description: "Workzup job board",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-[#111827] antialiased">
        <AuthProvider>
          <MessageNotificationProvider>
            <ApplicationNotificationProvider>
              <AutoRefresh interval={3000} />
              <div className="flex min-h-screen flex-col">
                <HeaderWrapper />
                <MainContentWrapper>{children}</MainContentWrapper>
                <Footer />
              </div>
              <Toaster />
            </ApplicationNotificationProvider>
          </MessageNotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
