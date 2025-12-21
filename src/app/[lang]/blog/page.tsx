import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<PageParams>;
}

interface PageParams {
  lang: string;
}

export { generateStaticParams } from "./static-params";

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  redirect(`/${lang}/blog/page/1`);
}
