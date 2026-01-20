'use client';

import { useComponent } from './use-component';
import {
  TokenImage,
  TextContent,
  FormElements,
  SendButton,
  SuccessMessage,
} from './components';

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

export default function BuyMeCoffeeWidget({ authorName, walletAddress, dictionary }: TippingWidgetProps) {
  const {
    amount,
    setAmount,
    selectedChainId,
    setSelectedChainId,
    selectedNetwork,
    showSuccess,
    isPending,
    isConnected,
    handleSendTransaction,
  } = useComponent(walletAddress);

  return (
    <div className="w-full overflow-hidden flex md:flex-row flex-col">
      <TokenImage />

      <div className="px-8 py-8 md:px-12 md:py-16 flex-1 flex flex-col gap-4">
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
          isConnected={isConnected}
          amount={amount}
          symbol={selectedNetwork?.symbol}
          dictionary={dictionary}
          onClick={handleSendTransaction}
        />
      </div>

      {showSuccess && <SuccessMessage message={dictionary.thankYou} />}
    </div>
  );
}
