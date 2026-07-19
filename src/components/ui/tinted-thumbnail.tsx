import Image from "next/image";

interface TintedThumbnailProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  imageClassName?: string;
  // "hero" fades to black at the bottom for text legibility; "card" is a
  // top-to-bottom vignette (barely there at top, a stronger duotone at the
  // bottom) that clears entirely on hover — render inside a `group` ancestor.
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
        className={`object-cover contrast-110 ${
          isHero
            ? "grayscale"
            : "grayscale-[60%] transition-[filter] duration-300 group-hover:grayscale-0"
        } ${imageClassName ?? ""}`}
      />
      {isHero ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--primary-500) 70%, black) 0%, black 100%)",
              mixBlendMode: "multiply",
            }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </>
      ) : (
        <div
          className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--primary-500) 55%, black) 100%)",
            mixBlendMode: "multiply",
          }}
        />
      )}
    </>
  );
}
