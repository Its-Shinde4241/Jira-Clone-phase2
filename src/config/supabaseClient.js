import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseKey) {
  console.log('NO KEY FOUND');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
