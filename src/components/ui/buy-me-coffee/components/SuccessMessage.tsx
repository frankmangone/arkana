import { Coffee } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
}

export function SuccessMessage({ message }: SuccessMessageProps) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/30 max-w-3xl">
      <Coffee className="w-4 h-4 text-green-400" />
      <p className="text-green-400 text-sm font-medium">
        {message}
      </p>
    </div>
  );
}
