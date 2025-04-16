// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Bookmark, Share2, ThumbsUp } from "lucide-react";
// import { toast } from "sonner";
// import type { Post } from "@/lib/types";
// import { addToReadingList } from "@/lib/actions";

// interface PostFooterProps {
//   post: Post;
//   lang: string;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   dictionary: any;
// }

// export function PostFooter({ post, /* lang, */ dictionary }: PostFooterProps) {
//   const [liked, setLiked] = useState(false);
//   const [likeCount, setLikeCount] = useState(post.likes || 0);
//   const [saved, setSaved] = useState(false);

//   const handleLike = () => {
//     setLiked(!liked);
//     setLikeCount(liked ? likeCount - 1 : likeCount + 1);

//     if (!liked) {
//       toast(dictionary.blog.postLiked, {
//         description: dictionary.blog.thanksForLiking,
//       });
//     }
//   };

//   const handleSave = async () => {
//     try {
//       await addToReadingList(post.id);
//       setSaved(true);
//       toast(dictionary.blog.postSaved, {
//         description: dictionary.blog.addedToReadingList,
//       });
//     } catch {
//       toast(dictionary.blog.error, {
//         description: dictionary.blog.errorSavingPost,
//         // variant: "destructive",
//       });
//     }
//   };

//   const handleShare = async () => {
//     try {
//       await navigator.share({
//         title: post.title,
//         text: post.excerpt,
//         url: window.location.href,
//       });
//     } catch {
//       // Fallback for browsers that don't support navigator.share
//       navigator.clipboard.writeText(window.location.href);
//       toast(dictionary.blog.linkCopied, {
//         description: dictionary.blog.linkCopiedToClipboard,
//       });
//     }
//   };

//   return (
//     <div className="border-t border-b py-6 my-8">
//       <div className="flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={handleLike}
//             className={liked ? "text-primary" : ""}
//           >
//             <ThumbsUp className="h-4 w-4 mr-2" />
//             {likeCount} {dictionary.blog.likes}
//           </Button>
//         </div>

//         <div className="flex items-center gap-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={handleSave}
//             disabled={saved}
//             className={saved ? "text-primary" : ""}
//           >
//             <Bookmark className="h-4 w-4 mr-2" />
//             {saved ? dictionary.blog.saved : dictionary.blog.save}
//           </Button>

//           <Button variant="ghost" size="sm" onClick={handleShare}>
//             <Share2 className="h-4 w-4 mr-2" />
//             {dictionary.blog.share}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
