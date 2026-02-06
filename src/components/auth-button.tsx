"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/providers/wallet-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function AuthButton() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { wallet, disconnect, isInitialized } = useWallet();

  // Don't render until we've checked localStorage to avoid flash
  if (!isInitialized) {
    return null;
  }

  if (wallet) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-[40px] rounded-none py-2 px-4 flex cursor-pointer items-center gap-2 text-base hover:text-primary-750 dark:text-gray-300 dark:hover:text-primary-750"
          >
            <Wallet className="h-5 w-5" />
            <span className="hidden sm:inline text-sm">
              {truncateAddress(wallet.address)}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem className="py-3 text-base" disabled>
            <span className="truncate block w-full text-xs text-muted-foreground">
              {wallet.walletName} ({wallet.networkType})
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="py-3 text-base" disabled>
            <span className="truncate block w-full text-sm">
              {truncateAddress(wallet.address)}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer py-3 text-base"
            onClick={disconnect}
          >
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="ghost"
      asChild
      className="h-[40px] rounded-none py-2 px-4 flex cursor-pointer items-center gap-1 text-base hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-750"
    >
      <Link href={`/${lang}/login`}>
        <User className="h-7 w-7 sm:h-6 sm:w-6" />
        Sign in
      </Link>
    </Button>
  );
}
