// Client
export { supabase } from "./client";
export { createServerClient, supabaseAdmin } from "./server";

// Services
export { articlesService } from "./services/articles";
export type { Article, ArticleListItem } from "./services/articles";

// Types
export type { Database } from "./types";
