import { HomePage } from "@/features/home";
import { HomeLayout } from "@/components/layouts/home-layout";

interface HomeParams {
  lang: string;
}

export interface PageProps {
  params: Promise<HomeParams>;
}

export { generateMetadata } from "./metadata";
export { generateStaticParams } from "./static-params";

export default async function Home(props: PageProps) {
  const { lang } = await props.params;

  return (
    <HomeLayout lang={lang}>
      <HomePage lang={lang} />
    </HomeLayout>
  );
}
