import { HTMLAttributes } from "react";

export function CustomUl({ children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <ul className="my-6" {...props}>
      {children}
    </ul>
  );
}

export function CustomOl({ children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <ol className="my-6" {...props}>
      {children}
    </ol>
  );
}

export function CustomLi({ children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <li className="mb-2" {...props}>
      {children}
    </li>
  );
}
