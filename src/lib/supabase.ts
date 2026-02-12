import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Keep app booting in local/dev even if env vars are missing.
  // Runtime API calls will fail with clear Supabase errors.
  console.error('Missing Supabase env vars: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient(
  supabaseUrl ?? 'https://example.supabase.co',
  supabaseKey ?? 'missing-key'
);
