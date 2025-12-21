import { notFound } from "next/navigation";
import { writers } from "@/lib/writers";
import { MainLayout } from "@/components/layouts/main-layout";
import { WritersPage } from "@/features/writers/list";
import { getDictionary } from "@/lib/dictionaries";

interface WritersPageParams {
  lang: string;
}

interface WritersPageProps {
  params: Promise<WritersPageParams>;
}

export { generateMetadata } from "./metadata";
export { generateStaticParams } from "./static-params";

export default async function Page({ params }: WritersPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // Convert the writers object into an array
  const writersList = Object.values(writers);

  if (!writersList || writersList.length === 0) {
    return notFound();
  }

  return (
    <MainLayout lang={lang}>
      <WritersPage lang={lang} dictionary={dict} writers={writersList} />
    </MainLayout>
  );
}
