"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
        className="w-full flex items-center justify-between text-left gap-4 cursor-pointer py-4 hover:text-primary-650 transition-colors"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${id}`}
      >
        <h2 className="text-2xl text-primary-750 font-semibold flex-1">{question}</h2>
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-6 h-6 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      </button>
      <div
        id={`faq-answer-${id}`}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-muted-foreground leading-relaxed pb-4">{answer}</p>
      </div>
    </section>
  );
}
