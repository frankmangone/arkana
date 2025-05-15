import { redirect } from "next/navigation";
import { writers } from "@/lib/writers";
import { languages } from "@/lib/i18n-config";

interface WriterPageParams {
  lang: string;
  slug: string;
}

interface WriterPageProps {
  params: Promise<WriterPageParams>;
}

export async function generateStaticParams() {
  const paths = [];

  for (const lang of languages) {
    for (const writerSlug of Object.keys(writers)) {
      paths.push({
        slug: writerSlug,
        lang,
      });
    }
  }

  return paths;
}

export default async function Page({ params }: WriterPageProps) {
  const { lang, slug } = await params;
  redirect(`/${lang}/writers/${slug}/page/1`);
}
