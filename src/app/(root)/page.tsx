import { HomePage } from "@/features/home";
import { HomeLayout } from "@/components/layouts/home-layout";
import { generateMetadata as generateHomeMetadata } from "../(localized)/[lang]/metadata";

// Renders the English homepage directly at "/" (no redirect, no flash) so
// real visitors and crawlers get content immediately. Canonicalizes to
// /en/ via the reused metadata generator, so this and /en/ consolidate as
// one page for SEO instead of competing as duplicate content.
export async function generateMetadata() {
  return generateHomeMetadata({ params: Promise.resolve({ lang: "en" }) });
}

export default function Page() {
  return (
    <HomeLayout lang="en">
      <HomePage lang="en" />
    </HomeLayout>
  );
}
