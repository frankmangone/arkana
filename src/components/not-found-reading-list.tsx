import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";

interface NotFoundReadingListProps {
  lang: string;
}

export async function NotFoundReadingList({ lang }: NotFoundReadingListProps) {
  const dict = await getDictionary(lang);

  // Get dictionary values for the reading list not found page
  const title = dict.readingLists.notFoundInLanguage?.title;
  const description = dict.readingLists.notFoundInLanguage?.description;
  const button = dict.readingLists.notFoundInLanguage?.button;

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground mb-8 max-w-md">{description}</p>
      <Button asChild variant="outline" size="lg">
        <Link
          href={`/${lang}/reading-lists`}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {button}
        </Link>
      </Button>
    </div>
  );
}
