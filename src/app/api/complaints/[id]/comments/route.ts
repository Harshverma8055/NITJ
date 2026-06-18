import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        if (!body.content || !body.content.trim()) {
            return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
        }

        const supabase = getSupabase();
        
        const isOfficial = session.role === 'ADMIN' || session.role === 'MAINTENANCE';

        const { data, error } = await supabase.from('complaint_comments').insert({
            complaint_id: id,
            author_user_id: session.userId,
            content: body.content.trim(),
            is_official: isOfficial,
        }).select().single();

        if (error) {
            console.error('Comment error:', error);
            return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
        }

        // Increment comment count
        const { data: comp } = await supabase.from('complaints').select('comment_count').eq('id', id).single();
        const newCount = (comp?.comment_count ?? 0) + 1;
        await supabase.from('complaints').update({ comment_count: newCount }).eq('id', id);

        return NextResponse.json({ success: true, comment: data });
    } catch (err) {
        console.error('Comment error:', err);
        return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }
}
