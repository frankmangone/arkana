"use client";

import { useEffect, useState } from "react";
import { getDictionary, type Dictionary } from "@/lib/dictionaries";

export function useDictionary(locale: string): Dictionary | null {
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);

  useEffect(() => {
    let active = true;

    getDictionary(locale).then((value) => {
      if (active) {
        setDictionary(value);
      }
    });

    return () => {
      active = false;
    };
  }, [locale]);

  return dictionary;
}
