import { redirect } from "next/navigation";

export default function Home() {
  redirect("/en");
}

export function generateStaticParams() {
  // Empty params since this page will redirect
  return [];
}
