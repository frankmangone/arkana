export function BigQuote({ children }: { children: React.ReactNode }) {
    return (
        <span className="block text-2xl leading-8 md:text-[1.75rem] md:leading-9 text-center my-14 mx-10 font-medium text-[#e9deff] break-words">
            {children}
        </span>
    );
};