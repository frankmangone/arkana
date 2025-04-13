"use client";

import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";

export function BuyMeCoffeeButton() {
  return (
    <Button
      className="fixed bottom-4 right-4 shadow-lg z-50 rounded-full"
      onClick={() =>
        window.open("https://www.buymeacoffee.com/yourusername", "_blank")
      }
    >
      <Coffee className="mr-2 h-4 w-4" />
      Buy me a coffee
    </Button>
  );
}
