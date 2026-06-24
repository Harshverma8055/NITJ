import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = getSupabase();

        // Get User
        const { data: user } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', session.userId)
            .single();

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        let studentData = null;
        let staffData = null;
        let complaints: any[] = [];

        // If student, run student + complaints queries in parallel
        if (user.role === 'STUDENT') {
            const { data: student } = await supabase
                .from('students')
                .select('id, roll_number, department, year, rating')
                .eq('user_id', user.id)
                .single();

            if (student) {
                // Fire complaints query immediately (don't wait to set studentData first)
                const [, { data: stdComplaints }] = await Promise.all([
                    Promise.resolve(studentData = student),
                    supabase
                        .from('complaints')
                        .select('id, title, category, zone, severity, status, is_emergency, created_at')
                        .eq('reporter_student_id', student.id)
                        .order('created_at', { ascending: false })
                        .limit(5)
                ]);
                complaints = stdComplaints || [];
            }
        } else if (user.role === 'MAINTENANCE') {
            const { data: staff } = await supabase
                .from('maintenance_staff')
                .select('id, user_id, department_code, department')
                .eq('user_id', user.id)
                .single();
                
            if (staff) {
                staffData = staff;
            }
        }

        return NextResponse.json({ 
            user: { 
                ...user, 
                studentId: studentData?.id,
                maintenanceDept: staffData?.department_code,
                maintenanceId: staffData?.id
            },
            student: studentData ? { ...studentData, user } : null,
            staff: staffData ? { ...staffData, user } : null,
            complaints
        });

    } catch (err) {
        console.error('Error in /api/auth/me:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
