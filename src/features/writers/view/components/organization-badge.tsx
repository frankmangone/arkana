import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arkana.blog";

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block inline-flex items-center gap-2 px-3 py-1.5 transition-colors"
    >
      {logoUrl && (
        <div className="relative w-10 h-10 overflow-hidden">
          <Image
            src={logoUrl ? `${baseUrl}${logoUrl}` : "/placeholder.svg"}
            alt={name}
            fill
            className="object-contain"
          />
        </div>
      )}
      <span className="text-sm font-medium">{name}</span>
      <ExternalLink className="h-5 w-5 text-gray-500 group-hover:text-primary-500 transition-colors" />
    </Link>
  );
}
