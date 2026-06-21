import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { newPassword } = body;

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Update auth user password
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
            password: newPassword
        });
        if (authError && authError.status !== 404 && !authError.message?.includes('not found')) {
            throw authError;
        }

        // Also update the password_hash in users table
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await supabaseAdmin.from('users').update({ password_hash: passwordHash }).eq('id', id);

        await logAdminAction(session.userId, session.name || 'Admin', 'RESET_USER_PASSWORD', 'USER', id, '{}');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
