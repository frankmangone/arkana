import { Coffee } from "lucide-react";

interface SuccessMessageProps {
  message: string;
}

export function SuccessMessage({ message }: SuccessMessageProps) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2 p-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 max-w-3xl">
      <Coffee className="w-4 h-4 text-emerald-600" />
      <p className="text-emerald-600 text-sm font-medium">{message}</p>
    </div>
  );
}
