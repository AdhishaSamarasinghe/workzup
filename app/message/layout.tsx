import { MessageSidebar } from "@/components/message";

export default function MessageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar Navigation - hidden on mobile */}
      <MessageSidebar activeItem="messaging" />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden pb-16 md:pb-0">
        {children}
      </div>
    </div>
  );
}
