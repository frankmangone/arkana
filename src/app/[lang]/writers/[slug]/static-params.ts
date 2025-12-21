import { writers } from "@/lib/writers";
import { languages } from "@/lib/i18n-config";

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

