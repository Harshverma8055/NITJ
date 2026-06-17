import bcrypt from 'bcryptjs';

const SUPABASE_URL = 'https://wnepvwokvadayyicgdpy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZXB2d29rdmFkYXl5aWNnZHB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYxNzAyOCwiZXhwIjoyMDk3MTkzMDI4fQ.fgwfLqr7OfVcFa15PBz6bBHgwIlssZ7Hl33lFYQuvRA';

async function updatePasswords() {
    console.log('Generating bcrypt hash for 123456...');
    const newHash = await bcrypt.hash('123456', 10);
    
    console.log('Updating all users in database...');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=neq.00000000-0000-0000-0000-000000000000`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ password_hash: newHash })
    });
    
    if (!res.ok) {
        const error = await res.text();
        console.error('Error updating passwords:', error);
    } else {
        console.log('Successfully updated passwords for all users.');
    }
}

updatePasswords().catch(console.error);
