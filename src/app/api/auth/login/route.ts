import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

        const supabase = getSupabase();
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, password_hash, role, is_active')
            .eq('email', email.toLowerCase().trim())
            .single();

        console.log("Login attempt for:", email);
        console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || 'FALLBACK USED');
        console.log("Service key present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
        console.log("Supabase error:", error);
        console.log("Supabase user found:", user ? "Yes" : "No");

        if (error || !user) {
            return NextResponse.json({ 
                error: 'Invalid email or password',
                debug: process.env.NODE_ENV !== 'production' ? { 
                    supabaseError: error?.message, 
                    supabaseCode: error?.code,
                    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'FALLBACK',
                    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY 
                } : undefined
            }, { status: 401 });
        }
        if (!user.is_active) return NextResponse.json({ error: 'Your account has been deactivated. Please contact admin.' }, { status: 403 });

        // bcrypt compare
        let valid = false;
        try {
            valid = await bcrypt.compare(password, user.password_hash);
        } catch (hashErr) {
            console.error('bcrypt error:', hashErr);
        }
        
        console.log("Password valid:", valid);

        if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

        const token = await signToken({ userId: user.id, name: user.name, email: user.email, role: user.role });

        const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });
        return response;
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 });
    }
}
