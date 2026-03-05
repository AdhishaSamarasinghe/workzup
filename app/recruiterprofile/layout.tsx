import type { ReactNode } from "react";
import Header from "../../components/Header";

type RecruiterProfileLayoutProps = {
  children: ReactNode;
};

export default function RecruiterProfileLayout({
  children,
}: RecruiterProfileLayoutProps) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
