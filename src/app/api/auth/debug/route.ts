import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
    try {
        const supabase = getSupabase();
        
        // Test: count users in DB
        const { count, error } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true });
        
        // Test: try to find admin
        const { data: admin, error: adminErr } = await supabase
            .from('users')
            .select('id, email, role')
            .eq('email', 'admin@nitj.ac.in')
            .maybeSingle();

        return NextResponse.json({
            status: 'ok',
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'USING FALLBACK',
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            totalUsers: count ?? 'ERROR',
            dbError: error?.message || null,
            adminFound: admin ? { id: admin.id, email: admin.email, role: admin.role } : null,
            adminError: adminErr?.message || null,
        });
    } catch (err) {
        return NextResponse.json({ status: 'error', message: String(err) }, { status: 500 });
    }
}
