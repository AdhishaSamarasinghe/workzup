import type { ReactNode } from "react";

type RecruiterProfileLayoutProps = {
  children: ReactNode;
};

export default function RecruiterProfileLayout({
  children,
}: RecruiterProfileLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}
