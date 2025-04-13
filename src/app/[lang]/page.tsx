import { HomePage } from "@/features/home";

interface HomeProps {
  params: { lang: string };
}

export default async function Home(props: HomeProps) {
  const { lang } = await props.params;

  return <HomePage lang={lang} />;
}
