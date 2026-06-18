const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key.trim()] = val.join('=').trim();
    return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log("Checking buckets...");
    const { data: buckets, error: getErr } = await supabase.storage.listBuckets();
    if (getErr) {
        console.error("Error listing buckets", getErr);
        return;
    }
    
    for (const bucketName of ['complaints', 'complaint-after']) {
        const exists = buckets.find(b => b.name === bucketName);
        if (!exists) {
            console.log(`Creating bucket ${bucketName}...`);
            const { data, error } = await supabase.storage.createBucket(bucketName, { public: true });
            if (error) console.error(`Error creating ${bucketName}:`, error);
            else console.log(`Created ${bucketName}!`);
        } else {
            console.log(`Bucket ${bucketName} exists. Making sure it is public...`);
            const { error } = await supabase.storage.updateBucket(bucketName, { public: true });
            if (error) console.error(`Error updating ${bucketName}:`, error);
            else console.log(`Updated ${bucketName} to public!`);
        }
    }
}
main();
