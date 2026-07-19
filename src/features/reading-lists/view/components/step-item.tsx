import Link from "next/link";

interface StepItemProps {
  index: number;
  title: string;
  url: string;
}

export function StepItem({ index, title, url }: StepItemProps) {
  return (
    <li className="!m-0 border-b border-rule py-4 last:border-b-0 before:!content-none">
      <Link href={url} className="group flex items-center gap-4 no-underline">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rule-strong text-sm tabular-nums text-ink-faint">
          {String(index).padStart(2, "0")}
        </span>
        <span className="text-base text-ink-body group-hover:text-primary-800">
          {title}
        </span>
      </Link>
    </li>
  );
}
