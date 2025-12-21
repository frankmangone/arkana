import { redirect } from "next/navigation";

interface WriterPageParams {
  lang: string;
  slug: string;
}

interface WriterPageProps {
  params: Promise<WriterPageParams>;
}

export { generateMetadata } from "./metadata";
export { generateStaticParams } from "./static-params";

export default async function Page({ params }: WriterPageProps) {
  const { lang, slug } = await params;
  redirect(`/${lang}/writers/${slug}/page/1`);
}
