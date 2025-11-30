import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined);
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase env snapshot', {
    MODE: import.meta.env.MODE,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    hasAnonKey: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY),
  });
  throw new Error(
    'Supabase credentials are missing. Declare VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env file.',
  );
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // RESUMO DO BUG PKCE:
    // Quando o flowType nao era informado o @supabase/auth-js passou a tentar PKCE
    // automaticamente, mas o app nunca salvava um code_verifier para os links de
    // recuperacao. O resultado eram chamadas /token?grant_type=pkce com parametros
    // vazios, derrubando o reset. Forcamos o fluxo implicit para receber tokens
    // direto e manter o comportamento esperado no Vercel.
    flowType: 'implicit',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});