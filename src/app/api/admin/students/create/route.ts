import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, roll, password, department, year } = body;

        if (!name || !email || !roll || !password || !department || !year) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
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
            role: 'STUDENT'
        });

        if (userError) throw userError;

        // 3. Insert into students table
        const { error: studentError } = await supabaseAdmin.from('students').insert({
            user_id: userId,
            roll_number: roll,
            department,
            year: parseInt(year)
        });

        if (studentError) throw studentError;

        // Fetch session to log the action
        const { getSession } = await import('@/lib/auth');
        const { logAdminAction } = await import('@/lib/audit');
        const session = await getSession();
        if (session && session.role === 'ADMIN') {
            await logAdminAction(
                session.userId,
                session.name || 'Admin',
                'CREATED_STUDENT',
                'STUDENT',
                userId,
                JSON.stringify({ name, email, roll })
            );
        }

        return NextResponse.json({ success: true, userId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
