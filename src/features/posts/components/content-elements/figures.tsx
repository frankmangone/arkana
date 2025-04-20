import { HTMLAttributes } from "react";

export function CustomFigure({
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <figure className="w-full" {...props}>
      {children}
    </figure>
  );
}

export function CustomFigcaption({ children }: HTMLAttributes<HTMLElement>) {
  // The figcaption will be handled by ZoomableImage
  // This is a fallback for any figure not containing our ZoomableImage
  return (
    <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
      {children}
    </figcaption>
  );
}
