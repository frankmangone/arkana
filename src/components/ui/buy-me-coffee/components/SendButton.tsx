import { Coffee, Loader2 } from 'lucide-react';
import { DEFAULT_AMOUNT } from '../use-component';

interface SendButtonProps {
  isPending: boolean;
  isConnected: boolean;
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
  isConnected,
  amount,
  symbol,
  dictionary,
  onClick,
}: SendButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className="px-4 py-3 bg-gradient-to-r from-[#FC7988] to-[#FB8A60] hover:bg-[#e09a6a] self-end text-white font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full md:w-auto min-w-[160px]"
    >
      {isPending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {dictionary.sending}
        </>
      ) : !isConnected ? (
        dictionary.connectWallet
      ) : (
        <>
          <Coffee className="w-5 h-5" />
          {dictionary.buyCoffee
            .replace('{amount}', amount || DEFAULT_AMOUNT)
            .replace('{symbol}', symbol || '')}
        </>
      )}
    </button>
  );
}
