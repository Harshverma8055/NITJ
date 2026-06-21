const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZXB2d29rdmFkYXl5aWNnZHB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYxNzAyOCwiZXhwIjoyMDk3MTkzMDI4fQ.fgwfLqr7OfVcFa15PBz6bBHgwIlssZ7Hl33lFYQuvRA';
const supabaseUrl = 'https://wnepvwokvadayyicgdpy.supabase.co/rest/v1';

async function fetchJson(endpoint) {
    const res = await fetch(`${supabaseUrl}/${endpoint}`, {
        headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`
        }
    });
    return res.json();
}

async function main() {
    try {
        console.log("=== USERS (NON-STUDENT) ===");
        const users = await fetchJson('users?role=neq.STUDENT');
        console.log(users);

        console.log("\n=== MAINTENANCE STAFF ===");
        const staff = await fetchJson('maintenance_staff');
        console.log(staff);

    } catch (err) {
        console.error(err);
    }
}

main();
