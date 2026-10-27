import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/** Client Supabase dans le navigateur, au nom de la personne connectée (la RLS s'applique). */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
