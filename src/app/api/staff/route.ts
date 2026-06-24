import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
    try {
        const supabase = getSupabase();
        
        // Fetch users who are staff and their maintenance staff details in parallel
        const [
            { data: users, error: usersError },
            { data: maintenanceStaff, error: maintenanceError }
        ] = await Promise.all([
            supabase
                .from('users')
                .select('id, name, email, role')
                .in('role', ['MAINTENANCE', 'FACULTY', 'ADMIN']),
            supabase
                .from('maintenance_staff')
                .select('*')
        ]);

        if (usersError) throw usersError;

        if (maintenanceError && maintenanceError.code !== '42P01') {
            console.error(maintenanceError);
        }

        const staff = users.map(u => {
            const m = maintenanceStaff?.find(s => s.user_id === u.id);
            return {
                id: u.id,
                user: u,
                department: m?.department || (u.role === 'ADMIN' ? 'Administration' : 'Faculty'),
                department_code: m?.department_code || '',
                role: u.role
            };
        });

        return NextResponse.json({ staff });
    } catch (err) {
        console.error('Fetch staff error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
