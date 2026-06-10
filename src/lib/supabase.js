import { createClient } from '@supabase/supabase-js'

let rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
let rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean surrounding quotes
if (rawUrl.startsWith('"') || rawUrl.startsWith("'")) {
  rawUrl = rawUrl.slice(1, -1);
}
if (rawKey.startsWith('"') || rawKey.startsWith("'")) {
  rawKey = rawKey.slice(1, -1);
}

export const supabase = createClient(rawUrl, rawKey);
