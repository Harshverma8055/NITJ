'use client';

import useSWR from 'swr';
import { ShieldCheck, User, MapPin, Mail, GraduationCap, Activity, Award, LogOut } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => { if (!r.ok) throw new Error(); return r.json(); });

export default function ProfilePage() {
    const { data, isLoading } = useSWR('/api/auth/me', fetcher);
    const student = data?.student || null;

    if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><div className="spinner"></div></div>;
    if (!student) return <div style={{ textAlign: 'center', color: 'white', marginTop: 100 }}>Profile not found</div>;

    const initials = student.user?.name ? student.user.name.substring(0, 2).toUpperCase() : 'ST';

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header / Cover Photo Area */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(2,6,23,0) 100%)',
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
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36, fontWeight: 700, boxShadow: '0 10px 25px rgba(99,102,241,0.4)',
                    marginBottom: 20
                }}>
                    {initials}
                </div>
                <h1 style={{ fontSize: 28, margin: '0 0 8px 0', fontWeight: 700 }}>{student.user?.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={16} /> {student.roll_number}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={16} /> {student.user?.email}</span>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                    <Activity size={24} color="#818cf8" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 4 }}>{student.rating || 0}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1 }}>PULSE</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                    <ShieldCheck size={24} color="#10b981" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 4 }}>Good</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1 }}>CAMPUS STATUS</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                    <Award size={24} color="#fbbf24" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 4 }}>Year {student.year || 1}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1 }}>ACADEMIC LEVEL</div>
                </div>
            </div>

            {/* Academic Info */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 32, marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, margin: '0 0 24px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <GraduationCap size={20} color="#6366f1" /> Academic Profile
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Department</div>
                        <div style={{ fontSize: 16, fontWeight: 500, color: 'white' }}>{student.department}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Roll Number</div>
                        <div style={{ fontSize: 16, fontWeight: 500, color: 'white' }}>{student.roll_number}</div>
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
