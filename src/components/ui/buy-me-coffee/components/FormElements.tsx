import { ChevronDown } from "lucide-react";
import { SUPPORTED_NETWORKS, DEFAULT_AMOUNT } from "../use-component";

interface FormElementsProps {
  amount: string;
  setAmount: (amount: string) => void;
  selectedChainId: number;
  setSelectedChainId: (chainId: number) => void;
  symbol?: string;
}

export function FormElements({
  amount,
  setAmount,
  selectedChainId,
  setSelectedChainId,
  symbol,
}: FormElementsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center max-w-3xl">
      {/* Amount Input */}
      <div className="flex-1 relative">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={DEFAULT_AMOUNT}
          step="1"
          min="1"
          className="w-full px-4 py-3 pr-20 bg-transparent rounded-[4px] border border-rule-strong text-ink-body placeholder:text-ink-faint focus:outline-none focus:border-salmon-700 transition-colors"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-[image:linear-gradient(135deg,var(--salmon-700),var(--orange-600))] bg-clip-text text-transparent font-medium">
          {symbol}
        </span>
      </div>

      {/* Network Selector */}
      <div className="flex-1 relative">
        <select
          value={selectedChainId}
          onChange={(e) => setSelectedChainId(Number(e.target.value))}
          className="w-full px-4 py-3 pr-10 bg-transparent rounded-[4px] border border-rule-strong text-ink-body focus:outline-none focus:border-salmon-700 transition-colors appearance-none cursor-pointer"
        >
          {SUPPORTED_NETWORKS.map((network) => (
            <option
              key={network.id}
              value={network.id}
              className="bg-surface-overlay text-ink-body"
            >
              {network.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-salmon-700 pointer-events-none" />
      </div>
    </div>
  );
}
