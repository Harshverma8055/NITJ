import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: students, error } = await supabaseAdmin
            .from('students')
            .select(`
                id,
                roll_number,
                department,
                year,
                users (
                    name,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const mapped = students.map(s => ({
            id: s.id,
            name: (s.users as any)?.name || 'Unknown',
            email: (s.users as any)?.email || 'No email',
            roll: s.roll_number,
            dept: s.department || 'Not Assigned',
            year: s.year?.toString() || '1'
        }));

        return NextResponse.json({ students: mapped });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
