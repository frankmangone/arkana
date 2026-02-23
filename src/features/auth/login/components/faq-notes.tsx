import Link from "next/link";
import type { AuthDictionary } from "@/lib/dictionaries";

interface FAQNotesProps {
  lang: string;
  dictionary: AuthDictionary;
}

export function FAQNotes(props: FAQNotesProps) {
  const { lang, dictionary } = props;

  return (
    <span className="text-sm text-muted-foreground block text-center mt-6">
      <Link
        href={`/${lang}/faq`}
        className="text-primary-750 hover:text-primary-650 transition-colors"
      >
        {dictionary.login.whyWallet || "Why do I need to connect my wallet?"}
      </Link>
    </span>
  );
}
