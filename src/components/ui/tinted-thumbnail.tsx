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

// Grayscale photo + primary-color multiply overlay; render inside a relative overflow-hidden container.
export function TintedThumbnail(props: TintedThumbnailProps) {
  const { src, alt, priority, sizes, imageClassName, variant = "card" } = props;

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover grayscale contrast-110 ${imageClassName ?? ""}`}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === "hero"
              ? "linear-gradient(180deg, color-mix(in srgb, var(--primary-500) 70%, black) 0%, black 100%)"
              : "color-mix(in srgb, var(--primary-500) 50%, transparent)",
          mixBlendMode: "multiply",
        }}
      />
      {variant === "hero" && <div className="absolute inset-0 bg-black/30" />}
    </>
  );
}
