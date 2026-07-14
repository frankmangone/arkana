"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface FAQItemProps {
  id: string;
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export function FAQItem({
  id,
  question,
  answer,
  defaultOpen = false,
}: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <section id={id} className="scroll-mt-20">
      <button
        onClick={toggle}
        className="group w-full flex items-center justify-between text-left gap-4 cursor-pointer py-5 transition-colors"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${id}`}
      >
        <h2 className="flex-1 text-xl font-medium text-ink-heading transition-colors group-hover:text-primary-800 md:text-2xl">
          {question}
        </h2>
        <div className="flex-shrink-0">
          <Plus
            className={`h-5 w-5 text-ink-muted transition-transform duration-300 ${
              isOpen ? "rotate-45" : ""
            }`}
          />
        </div>
      </button>
      <div
        id={`faq-answer-${id}`}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-ink-muted leading-relaxed pb-6">{answer}</p>
      </div>
    </section>
  );
}
