"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/providers/wallet-provider";
import { WalletStrategy } from "@/lib/wallet/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { polkadotStrategy } from "@/lib/wallet/strategies";

interface PolkadotLoginProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function PolkadotLogin(props: PolkadotLoginProps) {
  const { lang, dictionary } = props;

  const { connect, isConnecting } = useWallet();
  const router = useRouter();

  const handleConnect = async (strategy: WalletStrategy) => {
    try {
      await connect(strategy);
      router.push(`/${lang}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to connect wallet. Please try again.";
      toast.error(message);
    }
  };

  return (
    <Button
      type="button"
      onClick={() => handleConnect(polkadotStrategy)}
      disabled={isConnecting}
      className="w-full h-12 bg-background border border-border hover:bg-accent"
      size="lg"
      variant="outline"
    >
      <PolkadotSvg />
      <span className="ml-2">
        {isConnecting
          ? dictionary.login.connecting || "Connecting..."
          : dictionary.login.connectPolkadot || "Connect with Polkadot"}
      </span>
    </Button>
  );
}

function PolkadotSvg() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Polkadot logo - circle with dots */}
      <circle cx="12" cy="4.5" rx="2.5" ry="2.5" fill="#E6007A" />
      <circle cx="12" cy="19.5" rx="2.5" ry="2.5" fill="#E6007A" />
      <ellipse cx="12" cy="12" rx="5" ry="2.2" fill="#E6007A" />
      <ellipse
        cx="8"
        cy="8"
        rx="2.2"
        ry="1"
        transform="rotate(-30 8 8)"
        fill="#E6007A"
      />
      <ellipse
        cx="16"
        cy="8"
        rx="2.2"
        ry="1"
        transform="rotate(30 16 8)"
        fill="#E6007A"
      />
      <ellipse
        cx="8"
        cy="16"
        rx="2.2"
        ry="1"
        transform="rotate(30 8 16)"
        fill="#E6007A"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="2.2"
        ry="1"
        transform="rotate(-30 16 16)"
        fill="#E6007A"
      />
    </svg>
  );
}
