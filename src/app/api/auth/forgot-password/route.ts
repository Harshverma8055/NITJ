import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

        const supabase = getSupabase();
        const { data: user } = await supabase.from('users').select('id, name').eq('email', email.toLowerCase()).single();

        // Always return success to prevent email enumeration
        if (!user) return NextResponse.json({ message: 'If an account with that email exists, we\'ve sent a reset link.' });

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3_600_000); // 1 hour

        await supabase.from('password_reset_tokens').insert({ user_id: user.id, token, expires_at: expiresAt.toISOString(), used: false });

        // In production this would send an email. For demo, return the token.
        return NextResponse.json({
            message: 'If an account with that email exists, we\'ve sent a reset link.',
            demoToken: token, // REMOVE in production
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
