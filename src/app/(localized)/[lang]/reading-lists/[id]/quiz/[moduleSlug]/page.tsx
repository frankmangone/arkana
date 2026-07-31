import { MainLayout } from "@/components/layouts/main-layout";
import { NotFoundReadingList } from "@/components/not-found-reading-list";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getReadingList } from "@/lib/reading-lists";
import { getDictionary } from "@/lib/dictionaries";
import { withLocalePath } from "@/lib/site-config";
import { QuizAttemptView } from "@/features/quiz/attempt/quiz-attempt-view";

export { generateStaticParams } from "./static-params";

interface QuizAttemptPageParams {
  lang: string;
  id: string;
  moduleSlug: string;
}

interface QuizAttemptPageProps {
  params: Promise<QuizAttemptPageParams>;
}

export default async function Page({ params }: QuizAttemptPageProps) {
  const { lang, id, moduleSlug } = await params;

  const readingList = getReadingList({ lang, id });
  const readingListModule = readingList?.modules.find((m) => m.id === moduleSlug);

  if (!readingList || !readingListModule) {
    return (
      <MainLayout lang={lang}>
        <NotFoundReadingList lang={lang} />
      </MainLayout>
    );
  }

  const dict = await getDictionary(lang);
  const backUrl = withLocalePath(lang, `reading-lists/${id}`);

  return (
    <MainLayout lang={lang}>
      <div className="container mx-auto max-w-4xl px-6 py-16">
        <Breadcrumbs
          lang={lang}
          items={[
            { label: dict.readingLists.list.title, href: withLocalePath(lang, "reading-lists") },
            { label: readingList.title, href: backUrl },
            { label: readingListModule.title },
          ]}
          className="mb-10"
        />
        <QuizAttemptView
          lang={lang}
          listSlug={id}
          moduleSlug={moduleSlug}
          backUrl={backUrl}
          dictionary={dict.quizzes}
        />
      </div>
    </MainLayout>
  );
}
