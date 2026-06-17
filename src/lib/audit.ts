import { getSupabase } from './supabase';

export async function logAdminAction(
    adminId: string,
    adminName: string,
    action: string,
    targetType: string,
    targetId: string | null = null,
    details: string | null = null
) {
    try {
        const supabase = getSupabase();
        await supabase.from('audit_logs').insert({
            admin_id: adminId,
            admin_name: adminName,
            action,
            target_type: targetType,
            target_id: targetId,
            details
        });
    } catch (err) {
        console.error('Failed to write audit log:', err);
    }
}
