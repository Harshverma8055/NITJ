import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        // Run ALL independent queries in parallel
        const [
            { count: totalStudents },
            { count: totalComplaints },
            { count: pendingComplaints },
            { data: deptData },
            { data: recentComplaints }
        ] = await Promise.all([
            // 1. Total Students
            supabaseAdmin
                .from('students')
                .select('*', { count: 'exact', head: true }),
            // 2. Total Complaints (excludes PENDING_REVIEW and ANNOUNCEMENT)
            supabaseAdmin
                .from('complaints')
                .select('*', { count: 'exact', head: true })
                .neq('category', 'ANNOUNCEMENT')
                .not('status', 'eq', 'PENDING_REVIEW'),
            // 3. Pending Complaints
            supabaseAdmin
                .from('complaints')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'PENDING_REVIEW')
                .neq('category', 'ANNOUNCEMENT'),
            // 4. Department Breakdown
            supabaseAdmin
                .from('students')
                .select('department'),
            // 5. Recent Activity
            supabaseAdmin
                .from('complaints')
                .select(`
                    updated_at,
                    reporter_student_id,
                    students (
                        users (name)
                    ),
                    status
                `)
                .not('reporter_student_id', 'is', null)
                .order('updated_at', { ascending: false })
                .limit(6)
        ]);

        // Compute department breakdown from raw data
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
            .sort((a, b) => b.value - a.value);
        const maxDept = departments.length > 0 ? departments[0].value : 200;
        const mappedDepartments = departments.map(d => ({ ...d, max: Math.max(maxDept, 1) }));

        const recentActivity = (recentComplaints || []).map(c => {
            let actionText = 'Submitted Issue';
            if (c.status === 'APPROVED') actionText = 'Issue Approved';
            if (c.status === 'IN_PROGRESS') actionText = 'Work Started';
            if (c.status === 'RESOLVED') actionText = 'Issue Resolved';
            
            return {
                student: (c.students as any)?.users?.name || 'Unknown Student',
                action: actionText,
                date: new Date(c.updated_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
            };
        });

        return NextResponse.json({
            stats: {
                totalStudents: totalStudents || 0,
                totalComplaints: totalComplaints || 0,
                pendingComplaints: pendingComplaints || 0
            },
            departments: mappedDepartments,
            recentActivity
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
