import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { token, newPassword } = await req.json();
        if (!token || !newPassword) return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
        if (newPassword.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

        const supabase = getSupabase();
        const { data: resetRecord } = await supabase
            .from('password_reset_tokens')
            .select('user_id, expires_at, used')
            .eq('token', token)
            .single();

        if (!resetRecord) return NextResponse.json({ error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 });
        if (resetRecord.used) return NextResponse.json({ error: 'This reset link has already been used.' }, { status: 400 });
        if (new Date(resetRecord.expires_at) < new Date()) return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });

        const hash = await bcrypt.hash(newPassword, 12);
        await supabase.from('users').update({ password_hash: hash }).eq('id', resetRecord.user_id);
        await supabase.from('password_reset_tokens').update({ used: true }).eq('token', token);

        return NextResponse.json({ message: 'Password reset successfully.' });
    } catch (err) {
        console.error('Reset password error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
