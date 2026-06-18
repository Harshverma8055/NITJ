import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = getSupabase();
        
        // Add follow
        await supabase.from('complaint_followers').upsert({ complaint_id: id, user_id: session.userId });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Follow error:', err);
        return NextResponse.json({ error: 'Failed to follow' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = getSupabase();
        
        // Remove follow
        await supabase.from('complaint_followers').delete().eq('complaint_id', id).eq('user_id', session.userId);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Unfollow error:', err);
        return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 });
    }
}
