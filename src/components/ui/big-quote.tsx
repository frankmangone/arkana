import Image from "next/image";

export function BigQuote({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center my-8">
            <div className="flex justify-between w-full opacity-70">
                <Image src="/quote.png" alt="Big Quote" width={30} height={30} />
                <Image src="/quote.png" alt="Big Quote" width={30} height={30} className="rotate-90" />
            </div>
            <span className="block text-2xl leading-8 md:text-[1.75rem] md:leading-9 text-center my-0 mx-[30px] font-medium text-[#e9deff] break-words">
                {children}
            </span>
            <div className="flex justify-between w-full opacity-70">
                <Image src="/quote.png" alt="Big Quote" width={30} height={30} className="rotate-270" />
                <Image src="/quote.png" alt="Big Quote" width={30} height={30} className="rotate-180" />
            </div>
        </div>
    );
};