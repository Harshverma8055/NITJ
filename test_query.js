const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key.trim()] = val.join('=').trim();
    return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data: recentComplaints, error } = await supabase
            .from('complaints')
            .select(`
                updated_at,
                reporter_student_id,
                students (
                    users (name)
                ),
                status
            `)
            .in('status', ['IN_PROGRESS', 'RESOLVED'])
            .not('reporter_student_id', 'is', null)
            .order('updated_at', { ascending: false })
            .limit(6);
    console.log(error, JSON.stringify(recentComplaints, null, 2));
}
main();
