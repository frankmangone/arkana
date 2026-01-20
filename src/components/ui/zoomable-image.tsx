"use client";

import Image from "next/image";
import { useState, useEffect, ImgHTMLAttributes } from "react";

export function ZoomableImage({
  src,
  alt,
  width,
  height,
  className,
  title,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  // Add base path prefix to src
  const fullSrc = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${(src as string) ?? ""}`;
  
  // Use title as caption if provided
  const caption = title;
  
  // Set defaults
  const imageWidth = width ? Number(width) : 1000;
  const imageHeight = height ? Number(height) : 1000;
  const imageClassName = className ?? "";
  const [isZoomed, setIsZoomed] = useState(false);

  // Prevent scrolling when zoomed
  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isZoomed]);

  // Close zoom on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZoomed) {
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomed]);

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const isZoomable = caption?.toLowerCase().includes("[zoom]");
  // Remove the [zoom] marker from the displayed caption
  const displayCaption = caption?.replace(/\[zoom\]/gi, "").trim();

  // Extract any background color classes from the className
  const bgColorClass =
    imageClassName.split(" ").find((cls) => cls.startsWith("bg-")) || "";

  return (
    <>
      <figure className="w-full my-6">
        <div
          className={`relative rounded-none ${
            isZoomable ? "cursor-zoom-in" : ""
          } ${imageClassName}`}
          onClick={isZoomable ? toggleZoom : undefined}
        >
          <Image
            src={fullSrc}
            alt={alt ?? ""}
            width={imageWidth}
            height={imageHeight}
            className={`${imageWidth ? "" : "w-full"} ${imageClassName}`}
            {...props}
          />
          {isZoomable && (
            <div className="absolute top-2 right-2 bg-black/70 text-white p-1 text-xs px-2 zoom-indicator">
              Click to zoom
            </div>
          )}
        </div>
        {displayCaption && (
          <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            {displayCaption}
          </figcaption>
        )}
      </figure>

      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-zoom-out zoom-overlay"
          onClick={toggleZoom}
        >
          {/* Close button moved to top-right corner of screen */}
          <button
            className="fixed top-6 right-6 text-white bg-black/50 hover:bg-black/70 p-2 z-10"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the background click
              toggleZoom();
            }}
            aria-label="Close zoom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="relative max-w-[90vw] max-h-[90vh] zoom-content">
            {/* Apply background color class to a wrapper div */}
            <div className={`${bgColorClass}  p-0 overflow-hidden`}>
              <Image
                src={fullSrc}
                alt={alt ?? ""}
                width={2000}
                height={2000}
                className="max-h-[90vh] object-contain"
              />
            </div>
          </div>

          <div className="absolute bottom-4 left-0 right-0 text-center text-white">
            <p className="text-sm">ESC or click to close</p>
          </div>
        </div>
      )}
    </>
  );
}
