import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, email, roll, dept, year, role, originalRole, department, department_code } = body;
        const userRole = role || originalRole;

        // Update core user table
        const userUpdates: any = {};
        if (name) userUpdates.name = name;
        if (email) userUpdates.email = email;
        // If role changed (staff only), update the users table role field
        if (role && originalRole && role !== originalRole) {
            userUpdates.role = role;
        }

        if (Object.keys(userUpdates).length > 0) {
            const { error: userError } = await supabaseAdmin.from('users').update(userUpdates).eq('id', id);
            if (userError) throw userError;

            if (email) {
                 await supabaseAdmin.auth.admin.updateUserById(id, { email });
            }
        }

        // Determine if they are a student or staff to update specific fields
        if (userRole === 'STUDENT' && (roll || dept || year)) {
            const stuUpdates: any = {};
            if (roll) stuUpdates.roll_number = roll;
            if (dept) stuUpdates.department = dept;
            if (year) stuUpdates.year = parseInt(year);

            const { error: stuError } = await supabaseAdmin.from('students').update(stuUpdates).eq('user_id', id);
            if (stuError) throw stuError;
        } else if (originalRole === 'MAINTENANCE' || userRole === 'MAINTENANCE') {
            // For maintenance staff - update department_code and department name
            if (department_code || department) {
                const staffUpdates: any = {};
                if (department_code) {
                    staffUpdates.department_code = department_code;
                }
                if (department) {
                    staffUpdates.department = department;
                }

                const { error: staffError } = await supabaseAdmin
                    .from('maintenance_staff')
                    .update(staffUpdates)
                    .eq('user_id', id);
                if (staffError) throw staffError;
            }
        }

        await logAdminAction(session.userId, session.name || 'Admin', 'UPDATED_USER', 'USER', id, JSON.stringify(body));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Delete auth user (usually cascades, but we can delete from public tables too just in case)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authError && authError.status !== 404 && !authError.message?.includes('not found')) {
            throw authError;
        }

        await supabaseAdmin.from('users').delete().eq('id', id);
        
        await logAdminAction(session.userId, session.name || 'Admin', 'DELETED_USER', 'USER', id, '{}');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
