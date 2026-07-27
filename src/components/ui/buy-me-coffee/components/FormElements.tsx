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
      <div className="group flex-1 relative rounded-[5px] p-px bg-white/15 [&:hover:not(:focus-within)]:bg-white/25 focus-within:bg-[#FAA366] transition-colors">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={DEFAULT_AMOUNT}
          step="1"
          min="1"
          className="w-full px-4 py-3 pr-20 bg-[hsl(5,50%,11%)] rounded-[4px] text-ink-body placeholder:text-ink-faint focus:outline-none focus:bg-[hsl(5,42%,14%)] transition-colors"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint group-focus-within:text-[#FAA366] transition-colors font-medium">
          {symbol}
        </span>
      </div>

      {/* Network Selector */}
      <div className="flex-1 relative rounded-[5px] p-px bg-white/15 [&:hover:not(:focus-within)]:bg-white/25 focus-within:bg-[#FAA366] transition-colors">
        <select
          value={selectedChainId}
          onChange={(e) => setSelectedChainId(Number(e.target.value))}
          className="w-full px-4 py-3 pr-10 bg-[hsl(5,50%,11%)] rounded-[4px] text-ink-body focus:outline-none focus:bg-[hsl(5,42%,14%)] transition-colors appearance-none cursor-pointer"
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
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint pointer-events-none" />
      </div>
    </div>
  );
}
