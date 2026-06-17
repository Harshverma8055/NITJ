import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wnepvwokvadayyicgdpy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZXB2d29rdmFkYXl5aWNnZHB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYxNzAyOCwiZXhwIjoyMDk3MTkzMDI4fQ.fgwfLqr7OfVcFa15PBz6bBHgwIlssZ7Hl33lFYQuvRA';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2ZEm4FHv83dTMWMWL1t2uw_EouP9IR9';

// Use service role key if available, otherwise fall back to anon key
// Service role key bypasses RLS; anon key uses RLS policies
const serverKey = supabaseServiceKey || supabaseAnonKey;

// Server-side client (preferably with service role key)
export const supabaseAdmin = createClient(supabaseUrl, serverKey, {
    auth: { persistSession: false },
});

// Client-side / public client with anon key
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
});

// Helper to get the admin client for API routes
export function getSupabase() {
    return supabaseAdmin;
}
