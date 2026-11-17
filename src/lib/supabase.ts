import { createClient } from '@supabase/supabase-js';

// Supabase configuration - Only publishable / anon public key should EVER be used in client code!
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://hoopvqtuhbunxnkprjif.supabase.co';

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_GPgxXGK-0VO8wN7Uw-t1tw_hSxQq1W-';

export const isSupabaseConfigured = Boolean(
  (import.meta.env.VITE_SUPABASE_URL || supabaseUrl) &&
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseKey)
);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
