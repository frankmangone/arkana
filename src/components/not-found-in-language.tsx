import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";

interface NotFoundInLanguageProps {
  lang: string;
}

export async function NotFoundInLanguage({ lang }: NotFoundInLanguageProps) {
  const dict = await getDictionary(lang);

  // Get translations from the dictionary
  const { title, description, button } = dict.blog.notFoundInLanguage;

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground mb-8 max-w-md">{description}</p>
      <Button asChild variant="outline" size="lg" className="rounded-none">
        <Link href={`/${lang}`} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          {button}
        </Link>
      </Button>
    </div>
  );
}
