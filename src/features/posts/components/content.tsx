import { Post } from "@/lib/types";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { VideoEmbed } from "@/components/video-embed";
import { ZoomableImage } from "@/components/zoomable-image";

interface PostContentProps {
  post: Post;
}

// Function to generate slug from header text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
    .trim(); // Remove whitespace from ends
}

/* eslint-disable */
function createHeadingComponent(level: number) {
  return ({ children, ...props }: any) => {
    // Skip if children isn't a string or doesn't exist
    if (!children || typeof children !== "string") {
      return React.createElement(`h${level}`, props, children);
    }

    const slug = slugify(children);

    // Map heading levels directly to appropriate classes
    const headingClasses = {
      1: "text-4xl font-bold mt-8 mb-4",
      2: "text-3xl font-bold mt-7 mb-3",
      3: "text-2xl font-semibold mt-8 mb-2",
      4: "text-xl font-semibold mt-5 mb-2",
      5: "text-lg font-medium mt-4 mb-1",
      6: "text-base font-medium mt-3 mb-1",
    };

    const className = `group flex items-center ${
      headingClasses[level as keyof typeof headingClasses] || ""
    }`;

    return React.createElement(`h${level}`, { id: slug, className, ...props }, [
      children,
      <a
        key="anchor"
        href={`#${slug}`}
        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Link to ${children}`}
      >
        <LinkIcon size={16} />
      </a>,
    ]);
  };
}
/* eslint-enable */

export function PostContent({ post }: PostContentProps) {
  // More precise regex for matching video-embed tags
  // This uses a non-greedy approach and explicitly looks for the closing />
  const processedContent = post.content
    .replace(
      /:::\s*big-quote\s*([\s\S]*?)\s*:::/g,
      '<div class="big-quote">$1</div>'
    )
    .replace(/<video-embed\s+src="([^"]+)"\s*\/>/g, (_, src) => {
      return `<div class="video-embed" data-src="${src}"></div>`;
    });

  return (
    <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeKatex, { strict: false }],
          [rehypePrism, { showLineNumbers: true }],
        ]}
        components={{
          // Customize heading components with anchor links
          h1: createHeadingComponent(1),
          h2: createHeadingComponent(2),
          h3: createHeadingComponent(3),
          h4: createHeadingComponent(4),
          h5: createHeadingComponent(5),
          h6: createHeadingComponent(6),

          // Add proper spacing to paragraphs
          p: (props) => <p className="my-4" {...props} />,

          // Add custom link handling
          a: ({ href, ...props }) => {
            const isInternal =
              href && !href.startsWith("http") && !href.startsWith("#");

            if (isInternal) {
              return <Link className="text-blue-500" href={href} {...props} />;
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
                {...props}
              />
            );
          },

          // Add image handling
          img: ({ src, alt, width, className, title }) => {
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
          },

          // Handle figure and figcaption to work with ZoomableImage
          figure: ({ children, ...props }) => (
            <figure className="w-full" {...props}>
              {children}
            </figure>
          ),

          figcaption: ({ children }) => {
            // The figcaption will be handled by ZoomableImage
            // This is a fallback for any figure not containing our ZoomableImage
            return (
              <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                {children}
              </figcaption>
            );
          },

          // Add list handling
          ul: ({ children, ...props }) => (
            <ul className="list-disc pl-6 my-4 space-y-2" {...props}>
              {children}
            </ul>
          ),

          ol: ({ children, ...props }) => (
            <ol className="list-decimal pl-6 my-4 space-y-2" {...props}>
              {children}
            </ol>
          ),

          li: ({ children, ...props }) => (
            <li className="pl-1 mb-1" {...props}>
              {children}
            </li>
          ),

          hr: () => (
            <div className="fancy-divider">
              <span>•</span>
              <span>•</span>
              <span>•</span>
            </div>
          ),

          // Add video-embed component handler
          // @ts-expect-error - VideoEmbed is a custom component
          "video-embed": ({ src }) => {
            return src ? <VideoEmbed src={src} /> : null;
          },

          // Handle the video-embed div
          div: ({ className, ...props }) => {
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
                  videoId =
                    src.split("youtube.com/embed/")[1]?.split("?")[0] || "";
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
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
