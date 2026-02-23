import { redirect } from "next/navigation";

export default function Home() {
  redirect("/settings");
}
export { default } from "./job-apply/page";
