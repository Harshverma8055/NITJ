import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabase();

        // 1. Get student data + recent complaints
        const { data: student } = await supabase
            .from('students')
            .select('id, roll_number, department, year, rating, users:user_id(name)')
            .eq('user_id', session.userId)
            .single();

        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

        // Run all independent queries in parallel (none depend on each other)
        const [
            { data: complaints },
            { data: leaderboard },
            { data: announcements },
            { count: higherRankCount },
            { count: totalStudentsCount }
        ] = await Promise.all([
            // Student's complaints
            supabase
                .from('complaints')
                .select('id, title, category, zone, severity, status, is_emergency, created_at')
                .eq('reporter_student_id', student.id)
                .order('created_at', { ascending: false })
                .limit(5),
            // Leaderboard (Top 3)
            supabase
                .from('students')
                .select('id, rating, roll_number, users:user_id(name)')
                .order('rating', { ascending: false })
                .limit(3),
            // Announcements
            supabase
                .from('complaints')
                .select('id, title, content:description, severity:is_emergency, created_at, reporter_student_id, users:reporter_student_id(name)')
                .eq('category', 'ANNOUNCEMENT')
                .in('building', ['ALL', 'STUDENTS'])
                .order('created_at', { ascending: false })
                .limit(3),
            // Rank (how many have higher rating)
            supabase
                .from('students')
                .select('*', { count: 'exact', head: true })
                .gt('rating', student.rating || 0),
            // Total students count
            supabase
                .from('students')
                .select('*', { count: 'exact', head: true })
        ]);

        const currentRank = (higherRankCount || 0) + 1;

        return NextResponse.json({
            student: { ...student, user: student.users },
            complaints: complaints || [],
            leaderboard: leaderboard || [],
            announcements: announcements || [],
            rank: currentRank,
            totalStudents: totalStudentsCount || 1
        });

    } catch (err) {
        console.error('Error in /api/student/dashboard:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
