"use client";

import { useComponent } from "./use-component";
import {
  TokenImage,
  TextContent,
  FormElements,
  SendButton,
} from "./components";

interface TippingWidgetProps {
  authorName: string;
  walletAddress: string;
  dictionary: {
    title: string;
    description: string;
    sending: string;
    connectWallet: string;
    buyCoffee: string;
    thankYou: string;
  };
}

export default function BuyMeCoffeeWidget({
  authorName,
  walletAddress,
  dictionary,
}: TippingWidgetProps) {
  const {
    amount,
    setAmount,
    selectedChainId,
    setSelectedChainId,
    selectedNetwork,
    isPending,
    isWalletConnected,
    handleSendTransaction,
  } = useComponent(walletAddress);

  return (
    <div
      id="buy-me-coffee"
      className="overflow-hidden flex md:flex-row flex-col rounded-md border border-salmon-700/30 bg-[hsl(5,50%,11%)] lg:-mx-32"
    >
      <TokenImage />

      <div className="px-8 py-10 md:pl-12 md:pr-14 md:py-16 flex-1 flex flex-col gap-4">
        <TextContent
          title={dictionary.title}
          description={dictionary.description}
          authorName={authorName}
        />

        <FormElements
          amount={amount}
          setAmount={setAmount}
          selectedChainId={selectedChainId}
          setSelectedChainId={setSelectedChainId}
          symbol={selectedNetwork?.symbol}
        />

        <SendButton
          isPending={isPending}
          isWalletConnected={isWalletConnected}
          amount={amount}
          symbol={selectedNetwork?.symbol}
          dictionary={dictionary}
          onClick={handleSendTransaction}
        />
      </div>
    </div>
  );
}
