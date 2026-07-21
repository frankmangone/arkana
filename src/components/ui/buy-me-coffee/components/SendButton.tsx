import { Coffee, Loader2 } from "lucide-react";
import { DEFAULT_AMOUNT } from "../use-component";

interface SendButtonProps {
  isPending: boolean;
  isWalletConnected: boolean;
  amount: string;
  symbol?: string;
  dictionary: {
    sending: string;
    connectWallet: string;
    buyCoffee: string;
  };
  onClick: () => void;
}

export function SendButton({
  isPending,
  isWalletConnected,
  amount,
  symbol,
  dictionary,
  onClick,
}: SendButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className="px-4 py-3 rounded-[4px] bg-[image:linear-gradient(135deg,var(--salmon-700),var(--orange-500))] hover:brightness-110 self-end text-white font-medium transition-[filter] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full md:w-auto min-w-[160px]"
    >
      {isPending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {dictionary.sending}
        </>
      ) : !isWalletConnected ? (
        dictionary.connectWallet
      ) : (
        <>
          <Coffee className="w-5 h-5" />
          {dictionary.buyCoffee
            .replace("{amount}", amount || DEFAULT_AMOUNT)
            .replace("{symbol}", symbol || "")}
        </>
      )}
    </button>
  );
}
