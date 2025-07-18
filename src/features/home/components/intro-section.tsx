import { store } from "../store";

export function IntroSection() {
  const dict = store.getDictionary();

  return (
    <section className="w-full min-h-[30vh] flex flex-col md:flex-row items-center md:pt-12">
      <div className="container z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-8xl">
        <div className="z-10 flex-1 flex flex-col justify-center pt-6 md:pt-12 bg-transparent text-left w-full md:max-w-6/10 md:text-left xl:max-w-4/10">
          <h1 className="text-4xl md:text-5xl mb-8 mr-2 text-white">
            {dict!.home.intro.descriptionBig}
          </h1>
          <p className="text-xl text-gray-300 mb-10">
            {dict!.home.intro.descriptionSmall}
          </p>
        </div>
      </div>
    </section>
  );
}
