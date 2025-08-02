import React from "react";
import Image from "next/image";
import Link from "next/link";

interface UserSurveyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

// TODO: Do something about background
export function UserSurvey({ dictionary }: UserSurveyProps) {
  return (
    <section className="relative w-full py-8 px-4 my-12 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute bg-gradient-to-br from-primary-500/50 via-primary-500/5 to-transparent"></div>

      <div className="relative flex flex-col gap-8 items-center w-full z-10">
        <div className="w-[400px] relative">
          {/* Background square */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[240px] h-[240px] bg-primary-500/10"></div>
          </div>

          <div className="relative z-10 ml-4 flex items-center justify-center user-select-none">
            <Image
              src="/solo.png"
              alt="Reading list interface preview"
              width={600}
              height={400}
              className="w-full h-full object-cover object-left"
              priority
            />
          </div>
        </div>
        <h2 className="text-3xl text-center font-bold">
          {dictionary?.home?.userSurvey?.title}
        </h2>
        <p className="text-gray-400 text-center max-w-[700px]">
          {dictionary?.home?.userSurvey?.description}
        </p>
        <Link
          href="https://forms.gle/NLk49eNnu6jTwGMt8"
          className="inline-block px-12 py-3 mt-4 text-white transition-colors bg-primary-500 hover:bg-primary-600"
        >
          {dictionary?.home?.userSurvey?.button}
        </Link>
      </div>
    </section>
  );
}
