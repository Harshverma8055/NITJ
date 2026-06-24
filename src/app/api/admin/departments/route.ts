import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('complaints')
            .select('assigned_department_code, status')
            .neq('category', 'ANNOUNCEMENT');

        if (error) throw error;

        // Group and count
        const counts: Record<string, { total: number; active: number; resolved: number }> = {};
        (data || []).forEach(c => {
            const code = c.assigned_department_code || 'UNASSIGNED';
            if (!counts[code]) {
                counts[code] = { total: 0, active: 0, resolved: 0 };
            }
            counts[code].total += 1;
            if (c.status === 'RESOLVED') {
                counts[code].resolved += 1;
            } else {
                counts[code].active += 1;
            }
        });

        return NextResponse.json({ counts });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
