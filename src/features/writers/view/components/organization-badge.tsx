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
      className="inline-flex items-center gap-2 rounded-[4px] border border-rule-on-brand bg-white/15 px-3 py-2 backdrop-blur-sm transition-colors hover:bg-white/25"
    >
      {logoUrl && (
        <div className="relative w-7 h-7 overflow-hidden">
          <Image
            src={logoUrl ? withSiteUrl(logoUrl) : "/placeholder.svg"}
            alt={name}
            fill
            className="object-contain"
          />
        </div>
      )}
      <span className="text-sm font-medium">{name}</span>
      <ExternalLink className="h-4 w-4" />
    </Link>
  );
}
