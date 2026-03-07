import type { ReactNode } from "react";

type EditRecruiterLayoutProps = {
  children: ReactNode;
};

export default function EditRecruiterLayout({
  children,
}: EditRecruiterLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}
