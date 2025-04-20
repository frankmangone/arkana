import { HTMLAttributes } from "react";

export function CustomUl({ children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <ul className="list-disc pl-6 my-4 space-y-2" {...props}>
      {children}
    </ul>
  );
}

export function CustomOl({ children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <ol className="list-decimal pl-6 my-4 space-y-2" {...props}>
      {children}
    </ol>
  );
}

export function CustomLi({ children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <li className="pl-1 mb-1" {...props}>
      {children}
    </li>
  );
}
