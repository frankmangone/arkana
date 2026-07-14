export function BigQuote({ children }: { children: React.ReactNode }) {
  return (
    <span className="my-12 block w-full border-y border-rule py-10">
      <span className="mx-auto block w-full max-w-full px-2 text-center text-2xl font-medium leading-snug tracking-tight text-ink-heading md:text-[1.75rem] md:leading-snug break-words [overflow-wrap:anywhere] [&_*]:break-words [&_*]:[overflow-wrap:anywhere]">
        {children}
      </span>
    </span>
  );
}
