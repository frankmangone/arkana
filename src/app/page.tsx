import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to the English version
  redirect("/en");

  // This part won't be executed due to the redirect,
  // but TypeScript expects a return value
  return null;
}

export function generateStaticParams() {
  // Empty params since this page will redirect
  return [];
}
