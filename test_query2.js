const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key.trim()] = val.join('=').trim();
    return acc;
}, {});

const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
});

async function main() {
    const { data: complaint, error } = await supabaseAdmin
        .from('complaints')
        .select(`
            *,
            staff:assigned_staff_id(id, department, users:user_id(name)),
            complaint_updates (
                id, note, new_status, media_urls, created_at,
                author_user_id,
                users!complaint_updates_author_user_id_fkey (name, role)
            )
        `)
        .limit(1);
        
    console.log("Error:", JSON.stringify(error, null, 2));
    console.log("Data:", complaint ? "Exists" : "null");
}
main();
