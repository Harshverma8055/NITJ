import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.toLowerCase() || '';
        const dept = searchParams.get('dept') || '';
        const year = searchParams.get('year') || '';
        
        const supabase = getSupabase();

        let query = supabase
            .from('students')
            .select(`
                id,
                roll_number,
                department,
                year,
                rating,
                user:user_id (name, email)
            `);

        // We can do simple filtering here or return all and filter on client since there are only ~1100 students
        // For 1100 students, returning all of them is around 100kb, perfectly fine for client-side filtering.
        // But let's let the DB do it if we want.
        
        const { data, error } = await query.order('roll_number', { ascending: true }).limit(200);

        if (error) {
            console.error("DB Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ students: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
