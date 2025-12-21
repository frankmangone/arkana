"use client";

import React, { useState } from "react";

export function CustomVideoEmbed({ src }: HTMLVideoElement) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Extract video ID from various YouTube URL formats
  const extractVideoId = (url: string): string => {
    if (!url) return "";

    // Handle youtu.be format
    if (url.includes("youtu.be")) {
      return url.split("/").pop()?.split("?")[0] || "";
    }

    // Handle youtube.com/watch?v= format
    const match = url.match(/[?&]v=([^&#]+)/);
    if (match) return match[1];

    // Handle youtube.com/embed/ format
    if (url.includes("/embed/")) {
      return url.split("/embed/")[1].split("?")[0];
    }

    // If it appears to already be an ID, return it
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    return "";
  };

  if (!src) return null;

  const videoId = extractVideoId(src);

  if (!videoId) {
    return (
      <div className="bg-red-100 dark:bg-red-900 p-4 rounded my-4">
        Invalid YouTube URL
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg my-8"
      style={{ paddingBottom: "56.25%" }}
    >
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="animate-pulse flex flex-col items-center">
            <svg
              className="w-16 h-16 text-red-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
            <p className="mt-2">Loading video...</p>
          </div>
        </div>
      )}
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsLoaded(true)}
      ></iframe>
    </div>
  );
}
