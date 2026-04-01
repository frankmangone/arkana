export function BigQuote({ children }: { children: React.ReactNode }) {
  return (
    <span className="block w-full flex flex-col items-center my-8">
      <span className="block w-full max-w-full px-4 py-10 text-2xl leading-8 md:text-[1.75rem] md:leading-9 text-center my-0 font-medium text-[#e9deff] break-words [overflow-wrap:anywhere] [&_*]:break-words [&_*]:[overflow-wrap:anywhere]">
        {children}
      </span>
    </span>
  );
}
