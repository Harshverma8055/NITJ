import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

// GET /api/complaints/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = getSupabase();

        // Get complaint details
        const { data: complaint, error } = await supabase
            .from('complaints')
            .select(`
                *,
                complaint_media(*),
                complaint_updates(*),
                complaint_comments(
                    id, content, is_official, is_deleted, created_at,
                    author_user_id
                )
            `)
            .eq('id', id)
            .single();

        if (error || !complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        // Fetch reporter details if not anonymous
        if (!complaint.is_anonymous && complaint.reporter_student_id) {
            const { data: reporterObj } = await supabase
                .from('students')
                .select('user_id, roll_number')
                .eq('id', complaint.reporter_student_id)
                .single();

            if (reporterObj) {
                const { data: userObj } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', reporterObj.user_id)
                    .single();

                complaint.reporter = {
                    name: userObj?.name || 'Student',
                    rollNumber: reporterObj.roll_number
                };
            }
        }

        // Fetch comment authors
        if (complaint.complaint_comments && complaint.complaint_comments.length > 0) {
            const userIds = complaint.complaint_comments.map((c: any) => c.author_user_id).filter(Boolean);
            if (userIds.length > 0) {
                const { data: users } = await supabase.from('users').select('id, name').in('id', userIds);
                const userMap: Record<string, string> = {};
                users?.forEach((u: any) => { userMap[u.id] = u.name; });

                complaint.complaint_comments = complaint.complaint_comments.map((c: any) => ({
                    ...c,
                    author: { name: userMap[c.author_user_id] || 'User' }
                }));
            }
        }

        return NextResponse.json({ complaint });
    } catch (err) {
        console.error('Error fetching complaint:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/complaints/[id] - Used to update status (Admin/Maintenance)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'MAINTENANCE')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const supabase = getSupabase();

        // Get the complaint to know the reporter
        const { data: complaint } = await supabase
            .from('complaints')
            .select('id, reporter_student_id, status')
            .eq('id', id)
            .single();

        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        // Update the status
        const { error: updateError } = await supabase
            .from('complaints')
            .update({ status })
            .eq('id', id);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
        }

        // If status changes to APPROVED, add 5 points to the student!
        if (status === 'APPROVED' && complaint.status !== 'APPROVED') {
            const { data: student } = await supabase
                .from('students')
                .select('id, rating')
                .eq('id', complaint.reporter_student_id)
                .single();

            if (student) {
                const newRating = student.rating + 5;
                
                // Add 5 points
                await supabase
                    .from('students')
                    .update({ rating: newRating })
                    .eq('id', student.id);
            }
        }

        // Log the update
        await supabase.from('complaint_updates').insert({
            complaint_id: id,
            new_status: status,
            old_status: complaint.status,
            note: `Status updated to ${status} by ${session.name}`,
            posted_by_user_id: session.userId,
            is_system: true
        });

        return NextResponse.json({ success: true, status });
    } catch (err) {
        console.error('Error updating complaint:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
