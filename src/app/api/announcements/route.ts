import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const role = session.role; // 'STUDENT', 'MAINTENANCE', 'ADMIN', etc.
        
        let query = supabase
            .from('complaints')
            .select(`
                id, title, content:description, category, type:zone, 
                audience:building, 
                is_important:is_emergency,
                attachment_url:routing_reason,
                attachment_name:assigned_department_code,
                created_at
            `)
            .eq('category', 'ANNOUNCEMENT')
            .order('created_at', { ascending: false });

        // Filter based on audience if not admin
        if (role !== 'ADMIN') {
            const allowedAudiences = ['ALL'];
            if (role === 'STUDENT') allowedAudiences.push('STUDENTS');
            if (role === 'MAINTENANCE' || role === 'FACULTY') allowedAudiences.push('STAFF');
            
            query = query.in('building', allowedAudiences);
        }

        const { data: announcements, error } = await query;

        if (error) throw error;

        return NextResponse.json({ announcements: announcements || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
