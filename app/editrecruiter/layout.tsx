import type { ReactNode } from "react";
import EditRecruiterHeader from "../../components/editrecruiter/Header";

type EditRecruiterLayoutProps = {
  children: ReactNode;
};

export default function EditRecruiterLayout({
  children,
}: EditRecruiterLayoutProps) {
  return (
    <>
      <EditRecruiterHeader />
      {children}
    </>
  );
}
