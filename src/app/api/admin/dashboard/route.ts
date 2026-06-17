import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        // 1. Total Students
        const { count: totalStudents } = await supabaseAdmin
            .from('students')
            .select('*', { count: 'exact', head: true });

        // Removed Total Faculty and Pending Incidents queries

        // 4. Total Complaints
        const { count: totalComplaints } = await supabaseAdmin
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .neq('category', 'ANNOUNCEMENT');

        // 5. Department Breakdown
        const { data: deptData } = await supabaseAdmin
            .from('students')
            .select('department');

        const deptCounts: Record<string, number> = {};
        if (deptData) {
            deptData.forEach(s => {
                if (s.department) {
                    deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
                }
            });
        }
        
        const departments = Object.entries(deptCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // sort by value descending
            
        // Calculate max for the progress bar
        const maxDept = departments.length > 0 ? departments[0].value : 200;
        const mappedDepartments = departments.map(d => ({ ...d, max: Math.max(maxDept, 1) }));

        // 6. Recent Activity (Derived from recently updated complaints that were approved or resolved)
        const { data: recentComplaints } = await supabaseAdmin
            .from('complaints')
            .select(`
                updated_at,
                reporter_student_id,
                students (
                    users (name)
                ),
                status
            `)
            .in('status', ['IN_PROGRESS', 'RESOLVED'])
            .not('reporter_student_id', 'is', null)
            .order('updated_at', { ascending: false })
            .limit(6);

        const recentActivity = (recentComplaints || []).map(c => ({
            student: (c.students as any)?.users?.name || 'Unknown Student',
            action: c.status === 'RESOLVED' ? 'Issue Resolved' : 'Issue Approved',
            date: new Date(c.updated_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        }));

        return NextResponse.json({
            stats: {
                totalStudents: totalStudents || 0,
                totalComplaints: totalComplaints || 0
            },
            departments: mappedDepartments,
            recentActivity
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
