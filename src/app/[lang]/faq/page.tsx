import { FAQPage } from "@/features/faq";
import { MainLayout } from "@/components/layouts/main-layout";

export { generateStaticParams } from "../static-params";
export { generateMetadata } from "./metadata";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;

  return (
    <MainLayout lang={lang}>
      <FAQPage lang={lang} />
    </MainLayout>
  );
}
