import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

export const createServerClient = () => {
  // Double-check we're in a server context
  if (typeof window !== "undefined") {
    throw new Error(
      "createServerClient should only be called on the server side"
    );
  }

  const currentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const currentKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!currentUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing from environment variables"
    );
  }

  if (!currentKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing from environment variables"
    );
  }

  return createClient(currentUrl, currentKey);
};

// Lazy initialization - only create when actually needed
let _supabaseAdmin: ReturnType<typeof createServerClient> | null = null;

export const supabaseAdmin = () => {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createServerClient();
  }
  return _supabaseAdmin;
};
