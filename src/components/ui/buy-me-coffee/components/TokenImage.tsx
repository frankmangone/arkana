import Image from "next/image";

export function TokenImage() {
  return (
    <>
      {/* Mobile image */}
      <div className="relative block md:hidden w-[calc(100%-4rem)] mx-8 pointer-events-none z-10">
        <Image
          src="/images/buy-me-coffee/tokens-mobile.png"
          width={400}
          height={200}
          className="w-full h-full object-contain mix-blend-lighten"
          alt=""
        />
      </div>

      {/* Desktop image */}
      <div className="relative hidden md:block md:w-48 md:h-full pointer-events-none z-10">
        <Image
          src="/images/buy-me-coffee/tokens.png"
          width={100}
          height={100}
          className="w-full h-full object-contain mix-blend-lighten"
          alt=""
        />
      </div>
    </>
  );
}
