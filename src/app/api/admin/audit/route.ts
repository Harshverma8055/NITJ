import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabase();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        const { data: logs, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Failed to fetch audit logs:', error);
            // Return empty array if table doesn't exist yet rather than failing completely
            return NextResponse.json({ logs: [] });
        }

        return NextResponse.json({ logs });
    } catch (err) {
        console.error('GET /api/admin/audit error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
