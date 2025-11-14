import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined);
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase credentials are missing. Declare VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env file.',
  );
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
