import { getDictionary } from "@/lib/dictionaries";
import { SectionDivider } from "@/components/ui/section-divider";
import { FAQItem } from "./components/faq-item";

interface FAQPageProps {
  lang: string;
}

export async function FAQPage({ lang }: FAQPageProps) {
  const dict = await getDictionary(lang);

  return (
    <article className="container py-8 max-w-3xl mx-auto">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl mb-6 font-bold">
            {dict.faq.title || "Frequently Asked Questions"}
          </h1>
        </div>

        <SectionDivider />

        <div className="space-y-0">
          <FAQItem
            id="wallet"
            question={dict.faq.wallet.question}
            answer={dict.faq.wallet.answer}
            defaultOpen={false}
          />
          <FAQItem
            id="privacy"
            question={dict.faq.privacy.question}
            answer={dict.faq.privacy.answer}
            defaultOpen={false}
          />
          <FAQItem
            id="security"
            question={dict.faq.security.question}
            answer={dict.faq.security.answer}
            defaultOpen={false}
          />
        </div>
      </div>
    </article>
  );
}
