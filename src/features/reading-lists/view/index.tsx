import { ReadingList } from "@/lib/reading-lists";
import { getDictionary } from "@/lib/dictionaries";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getPostsFromReadingList } from "./fetch";
import { withLocalePath } from "@/lib/site-config";
import { JourneyStepper, type ModuleData } from "./components/journey-stepper";
import { formatReadingTime, sumReadingTimeMinutes } from "../reading-time";

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

  // Step numbers run across the whole journey (not reset per module), so the
  // last number always equals the total article count.
  let stepCount = 0;

  const modules: ModuleData[] = readingList.modules
    .map((module) => {
      const moduleSteps = module.items
        .filter((item) => postsBySlug.has(item.postPath))
        .map((item) => {
          stepCount += 1;
          return {
            slug: item.slug,
            postPath: item.postPath,
            title: postsBySlug.get(item.postPath)!.title,
            url: withLocalePath(
              lang,
              `reading-lists/${readingList.slug}/${item.slug}`
            ),
            order: stepCount,
          };
        });

      const modulePosts = module.items
        .map((item) => postsBySlug.get(item.postPath))
        .filter((post): post is NonNullable<typeof post> => post != null);

      return {
        slug: module.slug,
        title: module.title,
        description: module.description,
        readingTime: formatReadingTime(sumReadingTimeMinutes(modulePosts)),
        steps: moduleSteps,
      };
    })
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
        <div className="mb-5 flex flex-wrap items-center gap-6">
          <h1 className="display-title !text-[clamp(2.25rem,5vw,3.75rem)] text-primary-750">
            {readingList.title}
          </h1>
          {readingList.ongoing && (
            <Badge variant="outline" className="mt-2">{dict.readingLists.ongoing}</Badge>
          )}
        </div>

        <p className="max-w-[60ch] text-xl text-ink-muted">
          {readingList.description}
        </p>
      </header>

      <JourneyStepper
        lang={lang}
        listSlug={readingList.slug}
        modules={modules}
        moduleLabel={dict.readingLists.module}
        readLabel={dict.readingLists.read}
        takeQuizLabel={dict.readingLists.takeQuiz}
      />
    </div>
  );
}
