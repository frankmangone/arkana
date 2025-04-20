import { ZoomableImage } from "@/components/zoomable-image";
import { ImgHTMLAttributes } from "react";

export function CustomImage({
  src,
  alt,
  width,
  className,
  title,
}: ImgHTMLAttributes<HTMLImageElement>) {
  const fullSrc = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${
    (src as string) ?? ""
  }`;

  // Check if this image is within a figure with a figcaption
  // We'll pass the title attribute as the caption for our ZoomableImage
  return (
    <ZoomableImage
      src={fullSrc}
      alt={alt ?? ""}
      className={className ?? ""}
      width={width ? Number(width) : 1000}
      height={1000}
      caption={title ?? ""}
    />
  );
}
