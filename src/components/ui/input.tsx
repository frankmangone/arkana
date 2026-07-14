import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[4px] border border-rule-strong bg-transparent px-3 py-2 text-sm text-ink-body transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ink-faint hover:border-primary-700/50 focus-visible:outline-none focus-visible:border-primary-700 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
