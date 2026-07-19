import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { withSiteUrl } from "@/lib/site-config";

interface OrganizationBadgeProps {
  name: string;
  url: string;
  logoUrl?: string;
}

export function OrganizationBadge({
  name,
  url,
  logoUrl,
}: OrganizationBadgeProps) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-[4px] border border-ink-on-brand/40 px-3 py-2 text-sm font-medium text-ink-on-brand transition-colors hover:border-ink-on-brand/70 hover:bg-white/10"
    >
      {logoUrl && (
        <div className="relative h-5 w-5 overflow-hidden">
          <Image
            src={logoUrl ? withSiteUrl(logoUrl) : "/placeholder.svg"}
            alt={name}
            fill
            className="object-contain"
          />
        </div>
      )}
      <span>{name}</span>
      <ExternalLink className="h-4 w-4" />
    </Link>
  );
}
