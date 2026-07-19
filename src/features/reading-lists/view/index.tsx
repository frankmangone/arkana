import { ReadingList } from "@/lib/reading-lists";
import { getDictionary } from "@/lib/dictionaries";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getPostsFromReadingList } from "./fetch";
import { withLocalePath } from "@/lib/site-config";
import { JourneyStepper, type ModuleData } from "./components/journey-stepper";

interface ReadingListPageProps {
  lang: string;
  readingList: ReadingList;
}

export async function ReadingListPage(props: ReadingListPageProps) {
  const { lang, readingList } = props;

  const dict = await getDictionary(lang);
  const backUrl = withLocalePath(lang, "reading-lists");

  const posts = await getPostsFromReadingList({ readingList, lang });
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));

  const modules: ModuleData[] = readingList.modules
    .map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      steps: module.items
        .filter((item) => postsBySlug.has(item.slug))
        .map((item) => ({
          id: item.id,
          slug: item.slug,
          title: postsBySlug.get(item.slug)!.title,
          url: withLocalePath(
            lang,
            `reading-lists/${readingList.id}/${item.id}`
          ),
        })),
    }))
    .filter((module) => module.steps.length > 0);

  return (
    <div className="container">
      <header className="mb-12 pb-10 pt-8">
        <Breadcrumbs
          lang={lang}
          items={[
            { label: dict.readingLists.list.title, href: backUrl },
            { label: readingList.title },
          ]}
          className="mb-12"
        />
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <h1 className="display-title !text-[clamp(2.25rem,5vw,3.75rem)] text-primary-750">
            {readingList.title}
          </h1>
          {readingList.ongoing && (
            <Badge variant="outline">{dict.readingLists.ongoing}</Badge>
          )}
        </div>

        <p className="max-w-[60ch] text-xl text-ink-muted">
          {readingList.description}
        </p>
      </header>

      <JourneyStepper modules={modules} />
    </div>
  );
}
