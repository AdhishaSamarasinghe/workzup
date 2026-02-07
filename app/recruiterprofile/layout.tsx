import type { ReactNode } from "react";
import ProfileHeader from "../../components/profile/Header";
import Footer from "../../components/Footer";

type RecruiterProfileLayoutProps = {
  children: ReactNode;
};

export default function RecruiterProfileLayout({
  children,
}: RecruiterProfileLayoutProps) {
  return (
    <>
      <ProfileHeader />
      {children}
    </>
  );
}
