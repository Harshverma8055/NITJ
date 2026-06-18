import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = getSupabase();
        
        let studentId = null;
        if (session.role === 'STUDENT') {
            const { data } = await supabase.from('students').select('id').eq('user_id', session.userId).single();
            if (data) studentId = data.id;
        }

        if (!studentId) {
            return NextResponse.json({ error: 'Only students can upvote' }, { status: 403 });
        }

        // Check if already voted
        const { data: existingVote } = await supabase
            .from('complaint_votes')
            .select('*')
            .eq('complaint_id', id)
            .eq('student_id', studentId)
            .maybeSingle();

        // Get current count
        const { data: comp } = await supabase.from('complaints').select('upvote_count').eq('id', id).single();
        let newCount = comp?.upvote_count ?? 0;

        if (existingVote) {
            // Remove vote
            await supabase.from('complaint_votes').delete().eq('id', existingVote.id);
            newCount = Math.max(0, newCount - 1);
            await supabase.from('complaints').update({ upvote_count: newCount }).eq('id', id);
        } else {
            // Add vote
            await supabase.from('complaint_votes').insert({ complaint_id: id, student_id: studentId });
            newCount++;
            await supabase.from('complaints').update({ upvote_count: newCount }).eq('id', id);
        }

        return NextResponse.json({ success: true, voted: !existingVote, upvote_count: newCount });
    } catch (err) {
        console.error('Vote error:', err);
        return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }
}
