import { PostPreview } from "@/lib/posts";

export function sumReadingTimeMinutes(posts: Array<PostPreview>): number {
  return posts.reduce((total, post) => {
    const minutes = parseInt(post.readingTime ?? "", 10);
    return total + (Number.isNaN(minutes) ? 0 : minutes);
  }, 0);
}

export function formatReadingTime(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}
