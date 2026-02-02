import type { ReactNode } from "react";

export default function CenteredCard({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm">
        {children}
      </div>
    </div>
  );
}
