import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { routeComplaint } from '@/lib/department-router';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const { data: complaint, error } = await supabase
            .from('complaints')
            .select(`
                *,
                complaint_media(*),
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
                .select('category, zone, severity, priority, reporter_student_id, status, is_emergency')
                .eq('id', id)
                .single();

            if (fetchErr || !complaint) return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
            if (complaint.status !== 'PENDING_REVIEW') return NextResponse.json({ error: 'Complaint already processed' }, { status: 400 });

            // 2. Find the correct technical department for this category/zone
            const routing = routeComplaint({
                category: complaint.category,
                zone: complaint.zone,
                severity: complaint.severity,
                isEmergency: false, // Resolve the technical department (e.g. ELECTRICAL_MAINT) instead of CAMPUS_SECURITY
                priority: complaint.priority,
            });
            
            const resolvedDeptCode = routing.department;
            const staffDeptSearch = resolvedDeptCode.split('_')[0]; // e.g. ELECTRICAL
            
            const { data: staff } = await supabase
                .from('maintenance_staff')
                .select('id')
                .ilike('department', `%${staffDeptSearch}%`)
                .limit(1)
                .maybeSingle();

            // 3. Update the complaint: status = ASSIGNED if staff is assigned, otherwise APPROVED
            const nextStatus = staff ? 'ASSIGNED' : 'APPROVED';
            const { error: updateErr } = await supabase
                .from('complaints')
                .update({ 
                    status: nextStatus, 
                    assigned_staff_id: staff ? staff.id : null,
                    assigned_department_code: resolvedDeptCode
                })
                .eq('id', id);

            if (updateErr) throw updateErr;

            // Log timeline update in complaint_updates
            const { error: timelineErr } = await supabase
                .from('complaint_updates')
                .insert({
                    complaint_id: id,
                    old_status: 'PENDING_REVIEW',
                    new_status: nextStatus,
                    note: staff ? 'Complaint approved and assigned to staff' : 'Complaint approved by administrator',
                    posted_by_user_id: session.userId,
                    is_system: false
                });

            if (timelineErr) {
                console.error('Timeline log error:', timelineErr);
            }

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
