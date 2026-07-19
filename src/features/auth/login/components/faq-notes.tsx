import Link from "next/link";
import type { AuthDictionary } from "@/lib/dictionaries";

interface FAQNotesProps {
  lang: string;
  dictionary: AuthDictionary;
}

export function FAQNotes(props: FAQNotesProps) {
  const { lang, dictionary } = props;

  return (
    <span className="text-sm text-ink-muted block text-center mt-6">
      <Link
        href={`/${lang}/faq`}
        className="text-primary-800 hover:text-primary-900 transition-colors"
      >
        {dictionary.login.whyWallet || "Have questions? Visit our FAQ"}
      </Link>
    </span>
  );
}
