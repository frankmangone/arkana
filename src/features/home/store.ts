// Note: The store is NOT used in the client side, it is only used in the server side.

import { PostPreview } from "@/lib/posts";
import { createStore } from "@/lib/store";

// Define the home page data structure
export interface HomePageData extends Record<string, unknown> {
  latestPosts: PostPreview[];
}

export const store = createStore<HomePageData>();
