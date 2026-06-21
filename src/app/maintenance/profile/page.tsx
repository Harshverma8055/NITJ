'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, User, Mail, Wrench, ClipboardList, CheckCircle, LogOut } from 'lucide-react';

export default function MaintenanceProfilePage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [staff, setStaff] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [resolvedCount, setResolvedCount] = useState(0);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const meRes = await fetch('/api/auth/me');
                if (meRes.ok) {
                    const meData = await meRes.json();
                    if (meData.staff) {
                        setStaff(meData.staff);
                        
                        // Load stats
                        const deptCode = meData.staff.department_code || '';
                        const deptParam = deptCode ? `&department=${encodeURIComponent(deptCode)}` : '';
                        
                        const [pendingRes, resolvedRes] = await Promise.all([
                            fetch(`/api/complaints?limit=1&status=APPROVED,ASSIGNED,IN_PROGRESS${deptParam}`),
                            fetch(`/api/complaints?limit=1&status=RESOLVED${deptParam}`)
                        ]);

                        if (pendingRes.ok && resolvedRes.ok) {
                            const pendingData = await pendingRes.json();
                            const resolvedData = await resolvedRes.json();
                            setPendingCount(pendingData.total || 0);
                            setResolvedCount(resolvedData.total || 0);
                        }
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><div className="spinner"></div></div>;
    if (!staff) return <div style={{ textAlign: 'center', color: 'white', marginTop: 100 }}>Profile not found</div>;

    const initials = staff.user?.name ? staff.user.name.substring(0, 2).toUpperCase() : 'ST';

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header / Cover Photo Area */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(2,6,23,0) 100%)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 24,
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: 32
            }}>
                <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36, fontWeight: 700, boxShadow: '0 10px 25px rgba(6,182,212,0.4)',
                    marginBottom: 20
                }}>
                    {initials}
                </div>
                <h1 style={{ fontSize: 28, margin: '0 0 8px 0', fontWeight: 700 }}>{staff.user?.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Wrench size={16} /> Maintenance Staff</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={16} /> {staff.user?.email}</span>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                    <ClipboardList size={24} color="#06b6d4" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 4 }}>{pendingCount}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1 }}>PENDING QUEUE</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                    <CheckCircle size={24} color="#10b981" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 4 }}>{resolvedCount}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1 }}>JOBS COMPLETED</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                    <ShieldCheck size={24} color="#10b981" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 4 }}>Active</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1 }}>ACCOUNT STATUS</div>
                </div>
            </div>

            {/* Department Info */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 32, marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, margin: '0 0 24px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Wrench size={20} color="#06b6d4" /> Department Profile
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Assigned Department</div>
                        <div style={{ fontSize: 16, fontWeight: 500, color: 'white' }}>{staff.department}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Department Code</div>
                        <div style={{ fontSize: 16, fontWeight: 500, color: 'white' }}>{staff.department_code}</div>
                    </div>
                </div>
            </div>

            {/* Sign Out Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                    onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        window.location.href = '/login';
                    }}
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 12,
                        padding: '14px 40px',
                        color: '#ef4444',
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <LogOut size={18} /> Sign Out
                </button>
            </div>
        </div>
    );
}
