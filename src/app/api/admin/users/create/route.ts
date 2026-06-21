import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { role, name, email, password, roll, department, year, staffDepartmentCode, staffDepartmentName } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Name, email, password, and role are required' }, { status: 400 });
        }

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (authError) throw authError;
        
        const userId = authData.user.id;
        const passwordHash = await bcrypt.hash(password, 10);

        // 2. Insert into users table
        const { error: userError } = await supabaseAdmin.from('users').insert({
            id: userId,
            email,
            name,
            password_hash: passwordHash,
            role: role // 'STUDENT', 'MAINTENANCE', or 'ADMIN'
        });

        if (userError) throw userError;

        // 3. Handle Role-Specific Inserts
        if (role === 'STUDENT') {
            if (!roll || !department || !year) {
                throw new Error("Student requires roll, department, and year");
            }
            const { error: studentError } = await supabaseAdmin.from('students').insert({
                user_id: userId,
                roll_number: roll,
                department,
                year: parseInt(year)
            });
            if (studentError) throw studentError;
        } else if (role === 'MAINTENANCE') {
            if (!staffDepartmentCode || !staffDepartmentName) {
                throw new Error("Maintenance staff requires department code and name");
            }
            const { error: staffError } = await supabaseAdmin.from('maintenance_staff').insert({
                user_id: userId,
                department_code: staffDepartmentCode,
                department: staffDepartmentName
            });
            if (staffError) throw staffError;
        }

        // Fetch session to log the action
        const { getSession } = await import('@/lib/auth');
        const { logAdminAction } = await import('@/lib/audit');
        const session = await getSession();
        if (session && session.role === 'ADMIN') {
            await logAdminAction(
                session.userId,
                session.name || 'Admin',
                'CREATED_USER',
                'USER',
                userId,
                JSON.stringify({ name, email, role })
            );
        }

        return NextResponse.json({ success: true, userId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
