import { notFound } from "next/navigation";

export { generateStaticParams } from "../static-params";
export { generateMetadata } from "./metadata";

// interface PageProps {
//   params: Promise<{ lang: string }>;
// }

export default async function Page() { // { params }: PageProps) {
  // Not used for now.
  notFound();

  // const { lang } = await params;
  // const dict = await getDictionary(lang);

  // return (
  //   <MainLayout lang={lang} footer={false}>
  //     <SignupPage lang={lang} dictionary={dict.auth} />
  //   </MainLayout>
  // );
}
