import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: announcements, error } = await supabase
            .from('complaints')
            .select('*')
            .eq('category', 'ANNOUNCEMENT')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ announcements });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Use complaints table to store announcements
        const { data, error } = await supabase
            .from('complaints')
            .insert({
                title: body.title,
                description: body.content,
                category: 'ANNOUNCEMENT',
                zone: body.type, // Store ACADEMIC, EVENTS, etc here
                severity: 'LOW',
                priority: 'LOW',
                status: 'RESOLVED',
                is_anonymous: false
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ announcement: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
