import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.toLowerCase() || '';
        const dept = searchParams.get('dept') || '';
        const year = searchParams.get('year') || '';
        
        const supabase = getSupabase();

        let allStudents: any[] = [];
        const pageSize = 1000;

        // Fetch first page with total count
        const { data: firstPage, error: firstError, count } = await supabase
            .from('students')
            .select(`
                id,
                roll_number,
                department,
                year,
                rating,
                user:user_id (name, email)
            `, { count: 'exact' })
            .order('roll_number', { ascending: true })
            .range(0, pageSize - 1);

        if (firstError) {
            console.error("DB Error:", firstError);
            return NextResponse.json({ error: firstError.message }, { status: 500 });
        }

        if (firstPage) {
            allStudents = [...firstPage];
        }

        const total = count || 0;
        let offset = pageSize;

        // Fetch remaining pages
        while (offset < total) {
            const { data: pageData, error: pageError } = await supabase
                .from('students')
                .select(`
                    id,
                    roll_number,
                    department,
                    year,
                    rating,
                    user:user_id (name, email)
                `)
                .order('roll_number', { ascending: true })
                .range(offset, offset + pageSize - 1);

            if (pageError) {
                console.error("DB Error on offset", offset, ":", pageError);
                return NextResponse.json({ error: pageError.message }, { status: 500 });
            }

            if (pageData) {
                allStudents = [...allStudents, ...pageData];
            }
            offset += pageSize;
        }

        return NextResponse.json({ students: allStudents });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
