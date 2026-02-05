"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/providers/wallet-provider";
import { WalletStrategy } from "@/lib/wallet/types";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { metamaskStrategy } from "@/lib/wallet/strategies";
import { useWalletLogin } from "@/lib/api/hooks/usePosts";

interface MetamaskLoginProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function MetamaskLogin(props: MetamaskLoginProps) {
  const { lang, dictionary } = props;

  const { connect, isConnecting } = useWallet();
  const walletLogin = useWalletLogin();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleConnect = async (strategy: WalletStrategy) => {
    try {
      const walletInfo = await connect(strategy);
      // Register wallet with backend (signs a JWS and calls /api/login)
      await walletLogin.mutateAsync({ address: walletInfo.address });

      // Redirect to return URL or home
      const redirect = searchParams.get("redirect");
      router.push(redirect || `/${lang}`);
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
      onClick={() => handleConnect(metamaskStrategy)}
      disabled={isConnecting}
      className="w-full mb-4 h-12 bg-background border border-border hover:bg-accent"
      size="lg"
      variant="outline"
    >
      <MetaMaskSvg />
      <span className="ml-2">
        {isConnecting
          ? dictionary.login.connecting || "Connecting..."
          : dictionary.login.connectMetaMask || "Connect with MetaMask"}
      </span>
    </Button>
  );
}

function MetaMaskSvg() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simplified MetaMask fox icon */}
      <path
        d="M21.3 2L13.1 8.2L14.5 4.5L21.3 2Z"
        fill="#E17726"
        stroke="#E17726"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.7 2L10.8 8.3L9.5 4.5L2.7 2Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.4 16.8L16.3 20.1L20.8 21.3L22 16.9L18.4 16.8Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 16.9L3.2 21.3L7.7 20.1L5.6 16.8L2 16.9Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10.5L6.3 12.3L10.8 12.5L10.6 7.7L7.5 10.5Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 10.5L13.3 7.6L13.2 12.5L17.7 12.3L16.5 10.5Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.7 20.1L10.5 18.7L8.1 16.9L7.7 20.1Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 18.7L16.3 20.1L15.9 16.9L13.5 18.7Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.3 20.1L13.5 18.7L13.7 20.5L13.7 21.2L16.3 20.1Z"
        fill="#D5BFB2"
        stroke="#D5BFB2"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.7 20.1L10.3 21.2L10.3 20.5L10.5 18.7L7.7 20.1Z"
        fill="#D5BFB2"
        stroke="#D5BFB2"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.4 15.2L8 14.5L9.7 13.7L10.4 15.2Z"
        fill="#233447"
        stroke="#233447"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.6 15.2L14.3 13.7L16 14.5L13.6 15.2Z"
        fill="#233447"
        stroke="#233447"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.7 20.1L8.1 16.8L5.6 16.9L7.7 20.1Z"
        fill="#CC6228"
        stroke="#CC6228"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.9 16.8L16.3 20.1L18.4 16.9L15.9 16.8Z"
        fill="#CC6228"
        stroke="#CC6228"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.7 12.3L13.2 12.5L13.6 15.2L14.3 13.7L16 14.5L17.7 12.3Z"
        fill="#CC6228"
        stroke="#CC6228"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 14.5L9.7 13.7L10.4 15.2L10.8 12.5L6.3 12.3L8 14.5Z"
        fill="#CC6228"
        stroke="#CC6228"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.3 12.3L8.1 16.9L8 14.5L6.3 12.3Z"
        fill="#E27525"
        stroke="#E27525"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 14.5L15.9 16.9L17.7 12.3L16 14.5Z"
        fill="#E27525"
        stroke="#E27525"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.8 12.5L10.4 15.2L10.9 17.7L11 13.8L10.8 12.5Z"
        fill="#E27525"
        stroke="#E27525"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.2 12.5L13 13.8L13.1 17.7L13.6 15.2L13.2 12.5Z"
        fill="#E27525"
        stroke="#E27525"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.6 15.2L13.1 17.7L13.5 18.7L15.9 16.9L16 14.5L13.6 15.2Z"
        fill="#F5841F"
        stroke="#F5841F"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 14.5L8.1 16.9L10.5 18.7L10.9 17.7L10.4 15.2L8 14.5Z"
        fill="#F5841F"
        stroke="#F5841F"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.7 21.2L13.7 20.5L13.5 20.3L10.5 20.3L10.3 20.5L10.3 21.2L7.7 20.1L8.6 20.8L10.5 22.1L13.5 22.1L15.4 20.8L16.3 20.1L13.7 21.2Z"
        fill="#C0AC9D"
        stroke="#C0AC9D"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 18.7L13.1 17.7L10.9 17.7L10.5 18.7L10.3 20.5L10.5 20.3L13.5 20.3L13.7 20.5L13.5 18.7Z"
        fill="#161616"
        stroke="#161616"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.7 8.5L22.3 5.1L21.3 2L13.5 8L16.5 10.5L20.7 11.7L21.7 10.5L21.3 10.2L22 9.6L21.5 9.2L22.2 8.7L21.7 8.5Z"
        fill="#763E1A"
        stroke="#763E1A"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.7 5.1L2.3 8.5L1.8 8.7L2.5 9.2L2 9.6L2.7 10.2L2.3 10.5L3.3 11.7L7.5 10.5L10.5 8L2.7 2L1.7 5.1Z"
        fill="#763E1A"
        stroke="#763E1A"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.7 11.7L16.5 10.5L17.7 12.3L15.9 16.9L18.4 16.8L22 16.9L20.7 11.7Z"
        fill="#F5841F"
        stroke="#F5841F"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10.5L3.3 11.7L2 16.9L5.6 16.8L8.1 16.9L6.3 12.3L7.5 10.5Z"
        fill="#F5841F"
        stroke="#F5841F"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.2 12.5L13.5 8L14.5 4.5L9.5 4.5L10.5 8L10.8 12.5L10.9 13.8L10.9 17.7L13.1 17.7L13.1 13.8L13.2 12.5Z"
        fill="#F5841F"
        stroke="#F5841F"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
