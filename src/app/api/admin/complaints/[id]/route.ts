import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const { data: complaint, error } = await supabase
            .from('complaints')
            .select(`
                *,
                staff:assigned_staff_id(id, department, users:user_id(name)),
                complaint_updates (
                    id, note, new_status, created_at,
                    posted_by_user_id,
                    posted_by:users!posted_by_user_id (name, role)
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error("Fetch complaint error:", error);
            return NextResponse.json({ error: error.message || 'Complaint not found' }, { status: 404 });
        }
        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        // Map staff relation nicely
        if (complaint.staff && complaint.staff.users) {
            complaint.staff = {
                id: complaint.staff.id,
                name: complaint.staff.users.name,
                department: complaint.staff.department
            };
        } else {
            complaint.staff = null;
        }

        return NextResponse.json({ complaint });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();

        if (body.action === 'approve') {
            // 1. Get the complaint to find category and reporter
            const { data: complaint, error: fetchErr } = await supabase
                .from('complaints')
                .select('category, reporter_student_id, status, is_emergency')
                .eq('id', id)
                .single();

            if (fetchErr || !complaint) return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
            if (complaint.status !== 'PENDING_REVIEW') return NextResponse.json({ error: 'Complaint already processed' }, { status: 400 });

            // 2. Find a matching staff member for this category
            // We map categories to staff departments (e.g. ELECTRICAL -> ELECTRICAL_MAINT)
            let staffDeptQuery = complaint.category;
            if (complaint.category === 'ELECTRICAL') staffDeptQuery = 'ELECTRICAL_MAINT';
            if (complaint.category === 'PLUMBING') staffDeptQuery = 'PLUMBING_MAINT';
            
            const { data: staff, error: staffErr } = await supabase
                .from('maintenance_staff')
                .select('id')
                .ilike('department', `%${staffDeptQuery.split('_')[0]}%`)
                .limit(1)
                .single();

            // 3. Update the complaint: status = IN_PROGRESS, assign staff
            const { error: updateErr } = await supabase
                .from('complaints')
                .update({ 
                    status: 'IN_PROGRESS', 
                    assigned_staff_id: staff ? staff.id : null 
                })
                .eq('id', id);

            if (updateErr) throw updateErr;

            // Log action
            await logAdminAction(
                session.userId,
                session.name || 'Admin',
                'APPROVED_COMPLAINT',
                'COMPLAINT',
                id,
                JSON.stringify({ category: complaint.category, assigned_staff: staff ? staff.id : null })
            );

            // 4. Update Pulse Rating for the reporter
            if (complaint.reporter_student_id) {
                const pointsToAdd = complaint.is_emergency ? 15 : 5;
                const { data: student } = await supabase
                    .from('students')
                    .select('rating')
                    .eq('id', complaint.reporter_student_id)
                    .single();
                
                if (student) {
                    await supabase
                        .from('students')
                        .update({ rating: (student.rating || 0) + pointsToAdd })
                        .eq('id', complaint.reporter_student_id);
                }
            }

            return NextResponse.json({ success: true, message: 'Complaint approved and assigned!' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
