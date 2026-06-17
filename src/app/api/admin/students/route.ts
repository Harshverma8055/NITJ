import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        let allStudents: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
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
                .order('created_at', { ascending: false })
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (error) throw error;

            if (students && students.length > 0) {
                allStudents = [...allStudents, ...students];
                if (students.length < pageSize) {
                    hasMore = false;
                } else {
                    page++;
                }
            } else {
                hasMore = false;
            }
        }

        const mapped = allStudents.map(s => ({
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
