import { SurveyPage } from "@/features/survey";
import { MainLayout } from "@/components/layouts/main-layout";
import { getDictionary } from "@/lib/dictionaries";

export { generateStaticParams } from "./static-params";
export { generateMetadata } from "./metadata";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <MainLayout lang={lang}>
      <SurveyPage dictionary={dict} />
    </MainLayout>
  );
}
