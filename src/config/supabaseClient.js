import { createClient } from '@supabase/supabase-js';
import { configDotenv } from 'dotenv';

configDotenv();

const supabaseUrl = process.env.SUPABASE_URL || 'https://kkekbmtmjmdcngvxfedr.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZWtibXRtam1kY25ndnhmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MjczMTYsImV4cCI6MjA2MjAwMzMxNn0.1fwxU50jQgtabv_ACey4ATc5rbLer0dIGIPMLFoilQA';
if (!supabaseKey) {
  console.log('NO KEY FOUND');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
