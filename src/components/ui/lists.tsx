import { HTMLAttributes } from "react";

export function UnorderedList({ children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <ul className="my-6" {...props}>
      {children}
    </ul>
  );
}

export function OrderedList({ children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <ol className="my-6" {...props}>
      {children}
    </ol>
  );
}

export function ListElement({ children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <li className="mb-2" {...props}>
      {children}
    </li>
  );
}
