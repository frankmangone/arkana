import Image from "next/image";

export function BigQuote({ children }: { children: React.ReactNode }) {
  return (
    <span className="block w-full flex flex-col items-center my-8">
      <span className="flex justify-between w-full opacity-70">
        <Image src="/quote.png" alt="Big Quote" width={30} height={30} />
        <Image
          src="/quote.png"
          alt="Big Quote"
          width={30}
          height={30}
          className="rotate-90"
        />
      </span>
      <span className="block w-full max-w-full px-[30px] text-2xl leading-8 md:text-[1.75rem] md:leading-9 text-center my-0 font-medium text-[#e9deff] break-words [overflow-wrap:anywhere] [&_*]:break-words [&_*]:[overflow-wrap:anywhere]">
        {children}
      </span>
      <span className="flex justify-between w-full opacity-70">
        <Image
          src="/quote.png"
          alt="Big Quote"
          width={30}
          height={30}
          className="rotate-270"
        />
        <Image
          src="/quote.png"
          alt="Big Quote"
          width={30}
          height={30}
          className="rotate-180"
        />
      </span>
    </span>
  );
}
