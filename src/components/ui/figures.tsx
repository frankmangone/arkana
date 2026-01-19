import { HTMLAttributes } from "react";

/**
 * Figure component for handling figures in the post content
 * @param children - The children of the figure
 * @param props - The props of the figure
 * @returns The figure component
 */
export function Figure({
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <figure className="w-full" {...props}>
      {children}
    </figure>
  );
}

/**
 * FigCaption component for handling figcaptions in the post content
 * @param children - The children of the figcaption
 * @param props - The props of the figcaption
 * @returns The figcaption component
 */
export function FigCaption({ children }: HTMLAttributes<HTMLElement>) {
  // The figcaption will be handled by ZoomableImage
  // This is a fallback for any figure not containing our ZoomableImage
  return (
    <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
      {children}
    </figcaption>
  );
}
