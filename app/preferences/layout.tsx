import type { ReactNode } from "react";

type PreferencesLayoutProps = {
  children: ReactNode;
};

export default function PreferencesLayout({
  children,
}: PreferencesLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}
