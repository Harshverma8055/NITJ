import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { token, newPassword } = await req.json();
        if (!token || !newPassword) return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
        if (newPassword.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

        const supabase = getSupabase();
        const { data: resetRecord, error: dbError } = await supabase
            .from('password_reset_tokens')
            .select('user_id, expires_at, used')
            .eq('token', token)
            .single();

        if (dbError) {
            console.error('Error querying password reset token:', dbError);
        }

        if (!resetRecord) return NextResponse.json({ error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 });
        if (resetRecord.used) return NextResponse.json({ error: 'This reset link has already been used.' }, { status: 400 });
        if (new Date(resetRecord.expires_at) < new Date()) return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });

        const hash = await bcrypt.hash(newPassword, 12);
        const { error: updatePwError } = await supabase.from('users').update({ password_hash: hash }).eq('id', resetRecord.user_id);
        if (updatePwError) {
            console.error('Failed to update user password:', updatePwError);
            return NextResponse.json({ error: 'Failed to update password in database.' }, { status: 500 });
        }

        const { error: updateTokenError } = await supabase.from('password_reset_tokens').update({ used: true }).eq('token', token);
        if (updateTokenError) {
            console.error('Failed to mark token as used:', updateTokenError);
        }

        return NextResponse.json({ message: 'Password reset successfully.' });
    } catch (err) {
        console.error('Reset password error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
