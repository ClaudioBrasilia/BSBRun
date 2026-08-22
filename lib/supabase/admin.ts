import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './config';

/** Cliente usado apenas em webhooks server-side, nunca importado por componentes client. */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceRoleKey) return null;

  return createSupabaseClient(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
