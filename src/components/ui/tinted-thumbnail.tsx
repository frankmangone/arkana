import Image from "next/image";

interface TintedThumbnailProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  imageClassName?: string;
  // "hero" fades to black at the bottom for text legibility; "card" is a flat,
  // lighter tint that keeps the thumbnail recognizable at small sizes.
  variant?: "hero" | "card";
}

// Photo + primary-color multiply overlay; render inside a relative overflow-hidden container.
export function TintedThumbnail(props: TintedThumbnailProps) {
  const { src, alt, priority, sizes, imageClassName, variant = "card" } = props;
  const isHero = variant === "hero";

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover contrast-110 ${isHero ? "grayscale" : "grayscale-[60%]"} ${imageClassName ?? ""}`}
      />
      <div
        className="absolute inset-0"
        style={{
          background: isHero
            ? "linear-gradient(180deg, color-mix(in srgb, var(--primary-500) 70%, black) 0%, black 100%)"
            : "color-mix(in srgb, var(--primary-500) 35%, transparent)",
          mixBlendMode: "multiply",
        }}
      />
      <div className={`absolute inset-0 ${isHero ? "bg-black/30" : "bg-black/15"}`} />
    </>
  );
}
