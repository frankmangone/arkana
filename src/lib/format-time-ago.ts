import type { Dictionary } from "@/lib/dictionaries";

export function formatTimeAgo(
  dateString: string,
  dictionary: Dictionary | null,
  lang: string
): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: [number, { singular: string; plural: string }][] = [
    [
      31536000,
      {
        singular: dictionary?.comments?.time?.year || "year",
        plural: dictionary?.comments?.time?.years || "years",
      },
    ],
    [
      2592000,
      {
        singular: dictionary?.comments?.time?.month || "month",
        plural: dictionary?.comments?.time?.months || "months",
      },
    ],
    [
      86400,
      {
        singular: dictionary?.comments?.time?.day || "day",
        plural: dictionary?.comments?.time?.days || "days",
      },
    ],
    [
      3600,
      {
        singular: dictionary?.comments?.time?.hour || "hour",
        plural: dictionary?.comments?.time?.hours || "hours",
      },
    ],
    [
      60,
      {
        singular: dictionary?.comments?.time?.minute || "minute",
        plural: dictionary?.comments?.time?.minutes || "minutes",
      },
    ],
  ];

  const ago = dictionary?.comments?.time?.ago || "ago";
  const isSpanish = lang === "es";

  for (const [secondsInInterval, labels] of intervals) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      const label = interval > 1 ? labels.plural : labels.singular;
      return isSpanish
        ? `${ago} ${interval} ${label}`
        : `${interval} ${label} ${ago}`;
    }
  }

  return dictionary?.comments?.time?.justNow || "just now";
}
