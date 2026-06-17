import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    'https://wnepvwokvadayyicgdpy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZXB2d29rdmFkYXl5aWNnZHB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYxNzAyOCwiZXhwIjoyMDk3MTkzMDI4fQ.fgwfLqr7OfVcFa15PBz6bBHgwIlssZ7Hl33lFYQuvRA'
);

async function updatePasswords() {
    console.log('Generating bcrypt hash for 123456...');
    const newHash = await bcrypt.hash('123456', 10);
    
    console.log('Updating all users in database...');
    const { data, error } = await supabase
        .from('users')
        .update({ password_hash: newHash })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to update all rows
        
    if (error) {
        console.error('Error updating passwords:', error);
    } else {
        console.log('Successfully updated passwords for all users.');
    }
}

updatePasswords().catch(console.error);
