import { getDictionary } from "@/lib/dictionaries";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
        <Breadcrumbs lang={lang} items={[{ label: dict.faq.title }]} />
        <div className="full-bleed brand-hero">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
            <h1 className="display-title !text-[clamp(2.5rem,5vw,4rem)] text-ink-on-brand">
              {dict.faq.title || "Frequently Asked Questions"}
            </h1>
          </div>
        </div>

        <SectionDivider />

        <div className="space-y-0 divide-y divide-rule border-y border-rule">
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
