export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * O app funciona mesmo sem o Supabase configurado: as páginas públicas
 * (landing, calculadora) continuam no ar e as áreas protegidas exibem uma
 * mensagem pedindo a configuração, em vez de quebrar o build/deploy.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
