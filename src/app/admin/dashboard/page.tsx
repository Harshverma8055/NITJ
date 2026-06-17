'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Users, AlertTriangle, TrendingUp, TrendingDown, Plus, Megaphone } from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/dashboard')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const statsConfig = [
        { title: 'Total Students', value: data?.stats?.totalStudents || 0, icon: <GraduationCap size={20} color="#fbbf24" />, bg: 'rgba(245,158,11,0.1)', border: 'rgba(99,102,241,0.5)' },
        { title: 'Total Issues', value: data?.stats?.totalComplaints || 0, icon: <TrendingUp size={20} color="#3b82f6" />, bg: 'rgba(59,130,246,0.1)', border: 'rgba(255,255,255,0.05)' }
    ];

    const departments = data?.departments || [];
    const recentActivity = data?.recentActivity || [];

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner"></div></div>;

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700 }}>
                    👑 Admin Dashboard
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 14 }}>
                    Complete system overview and management
                </p>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
                {statsConfig.map((s, i) => (
                    <div key={i} style={{ 
                        background: '#13151A', border: `1px solid ${s.border}`, borderRadius: 16, padding: 20,
                        boxShadow: i === 0 ? '0 0 20px rgba(99,102,241,0.1)' : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, background: s.bg, marginBottom: 16 }}>
                            {s.icon}
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{s.title}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                <button 
                    onClick={() => router.push('/admin/students')}
                    style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
                >
                    <Plus size={18} /> Manage Students
                </button>
                <button 
                    onClick={() => router.push('/admin/announcements/create')}
                    style={{ background: '#1e2025', color: 'white', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
                >
                    <Megaphone size={18} /> Post Announcement
                </button>
            </div>

            {/* Bottom Two Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                
                {/* Department Breakdown */}
                <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 24px 0' }}>Department Breakdown</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {departments.map((d: any, i: number) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>{d.name}</span>
                                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>{d.value}</span>
                                </div>
                                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                    <div style={{ width: `${(d.value / d.max) * 100}%`, height: '100%', background: '#f59e0b', borderRadius: 2 }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Recent Activity</h2>
                        <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                            View All →
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Table Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                            <div>STUDENT</div>
                            <div>ACTION</div>
                            <div>DATE</div>
                        </div>
                        
                        {/* Table Body */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {recentActivity.map((r: any, i: number) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', padding: '16px 0', borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center', fontSize: 13 }}>
                                    <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{r.student}</div>
                                    <div style={{ color: '#10b981', fontWeight: 600 }}>{r.action}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)' }}>{r.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
