import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;let supabase;
if (!globalThis.supabase) {
  globalThis.supabase = createClient(supabaseUrl, supabaseKey);
}
supabase = globalThis.supabase;

export const getSupabaseAdmin = () => {
  const adminUrl = import.meta.env.VITE_SUPABASE_URL;
  const adminKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return createClient(adminUrl, adminKey, {
    auth: {
      persistSession: true,
      storageKey: 'supabase.adminClient',
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

export default supabase;