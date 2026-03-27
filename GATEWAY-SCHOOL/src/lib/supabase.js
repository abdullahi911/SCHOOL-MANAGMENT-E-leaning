import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Default client (used everywhere for regular user session)
let supabase;
if (!globalThis.supabase) {
  globalThis.supabase = createClient(supabaseUrl, supabaseKey);
}
supabase = globalThis.supabase;

// Lazy admin client (for server-like operations in browser)
// Will not persist session and avoids creating multiple instances
let supabaseAdmin;
export const getSupabaseAdmin = () => {
  if (!globalThis.supabaseAdmin) {
    globalThis.supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return globalThis.supabaseAdmin;
};

export default supabase;