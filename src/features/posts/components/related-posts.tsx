// import Link from "next/link";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { getRelatedPosts } from "@/lib/blog";

// interface RelatedPostsProps {
//   tags: string[];
//   currentPostId: string;
//   lang: string;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   dictionary: any;
// }

// export async function RelatedPosts({
//   tags,
//   currentPostId,
//   lang,
//   dictionary,
// }: RelatedPostsProps) {
//   const relatedPosts = await getRelatedPosts(tags, currentPostId, lang);

//   if (relatedPosts.length === 0) {
//     return null;
//   }

//   return (
//     <section className="mt-12">
//       <h2 className="text-2xl font-bold mb-6">
//         {dictionary.blog.relatedPosts}
//       </h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {relatedPosts.map((post) => (
//           <Card key={post.id}>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-lg line-clamp-2">
//                 <Link
//                   href={`/${lang}/blog/${post.slug}`}
//                   className="hover:underline"
//                 >
//                   {post.title}
//                 </Link>
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-sm text-muted-foreground line-clamp-2">
//                 {post.excerpt}
//               </p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </section>
//   );
// }
