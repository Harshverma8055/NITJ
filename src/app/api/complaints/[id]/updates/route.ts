import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

// POST /api/complaints/[id]/updates
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'MAINTENANCE')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { note, new_status, media_urls } = body;

        if (!new_status) {
            return NextResponse.json({ error: 'new_status is required' }, { status: 400 });
        }

        const supabase = getSupabase();

        // 1. Fetch current status and details of complaint
        const { data: complaint, error: fetchError } = await supabase
            .from('complaints')
            .select('status, assigned_staff_id')
            .eq('id', id)
            .single();

        if (fetchError || !complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        // 2. Determine update payload
        const updateData: any = { status: new_status };

        // If the staff is accepting the job or starting work directly, assign it to them
        if ((new_status === 'ASSIGNED' || new_status === 'IN_PROGRESS') && !complaint.assigned_staff_id) {
            const { data: mStaff } = await supabase
                .from('maintenance_staff')
                .select('id')
                .eq('user_id', session.userId)
                .maybeSingle();

            if (mStaff) {
                updateData.assigned_staff_id = mStaff.id;
            }
        }

        // Update complaint
        const { error: updateError } = await supabase
            .from('complaints')
            .update(updateData)
            .eq('id', id);

        if (updateError) {
            console.error('Update complaint error:', updateError);
            return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
        }

        // 3. If there are media proof files (for resolving), insert them into complaint_media
        if (media_urls && media_urls.length > 0) {
            const mediaRows = media_urls.map((url: string) => ({
                complaint_id: id,
                storage_path: url,
                public_url: url,
                media_type: 'IMAGE',
                is_before: false,
                is_after: true,
                uploaded_by_id: session.userId,
            }));

            const { error: mediaError } = await supabase
                .from('complaint_media')
                .insert(mediaRows);

            if (mediaError) {
                console.error('Insert media error:', mediaError);
            }
        }

        // 4. Log the update in complaint_updates
        const { error: logError } = await supabase
            .from('complaint_updates')
            .insert({
                complaint_id: id,
                old_status: complaint.status,
                new_status: new_status,
                note: note || (new_status === 'IN_PROGRESS' ? 'Work started on the complaint' : new_status === 'ASSIGNED' ? 'Job accepted by staff' : `Status updated to ${new_status}`),
                posted_by_user_id: session.userId,
                is_system: false
            });

        if (logError) {
            console.error('Log update error:', logError);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('POST updates error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
