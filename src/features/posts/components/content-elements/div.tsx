import { HTMLAttributes } from "react";

// Handle the video-embed div
export function CustomDiv({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  if (className === "video-embed") {
    // @ts-expect-error - VideoEmbed is a custom component
    const src = props["data-src"];
    if (!src) return null;

    // Extract video ID
    let videoId = "";
    try {
      if (src.includes("youtu.be/")) {
        videoId = src.split("youtu.be/")[1]?.split("?")[0] || "";
      } else if (src.includes("youtube.com/watch")) {
        const match = src.match(/[?&]v=([^&#]+)/);
        videoId = match ? match[1] : "";
      } else if (src.includes("youtube.com/embed/")) {
        videoId = src.split("youtube.com/embed/")[1]?.split("?")[0] || "";
      } else if (/^[a-zA-Z0-9_-]{11}$/.test(src)) {
        videoId = src;
      }
    } catch (err) {
      console.error("Error extracting video ID:", err);
    }

    if (!videoId) {
      console.error("Could not extract video ID from:", src);
      return (
        <div className="bg-red-100 p-4 my-4 rounded">
          Invalid YouTube URL: {src}
        </div>
      );
    }

    return (
      <div className="my-8">
        <div
          className="relative w-full rounded-lg overflow-hidden"
          style={{ paddingBottom: "56.25%" }}
        >
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // Default div handling
  return <div className={className} {...props} />;
}
