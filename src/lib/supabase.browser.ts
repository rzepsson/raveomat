import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

export const supabaseBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey);
