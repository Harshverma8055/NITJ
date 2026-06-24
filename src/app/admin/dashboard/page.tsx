'use client';

import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { GraduationCap, Users, AlertTriangle, TrendingUp, TrendingDown, Plus, Megaphone } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminDashboard() {
    const router = useRouter();
    const { data, error, isLoading } = useSWR('/api/admin/dashboard', fetcher);

    const statsConfig = [
        { title: 'Total Students', value: data?.stats?.totalStudents || 0, icon: <GraduationCap size={20} color="#fbbf24" />, bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
        { title: 'Pending Issues', value: data?.stats?.pendingComplaints || 0, icon: <AlertTriangle size={20} color="#ef4444" />, bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.5)', glow: true },
        { title: 'Total Issues', value: data?.stats?.totalComplaints || 0, icon: <TrendingUp size={20} color="#3b82f6" />, bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' }
    ];

    const departments = data?.departments || [];
    const recentActivity = data?.recentActivity || [];

    if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner"></div></div>;

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ marginBottom: 32, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
                <h1 style={{ fontSize: 32, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800 }}>
                    <span style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin</span> Dashboard
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 15 }}>
                    Complete system overview and management
                </p>
            </div>

            {/* Stats Row */}
            <div className="stats-grid">
                {statsConfig.map((s, i) => (
                    <div key={i} style={{ 
                        background: '#13151A', border: `1px solid ${s.border}`, borderRadius: 20, padding: 24,
                        boxShadow: s.glow ? `0 8px 30px ${s.bg}` : '0 4px 20px rgba(0,0,0,0.2)',
                        display: 'flex', alignItems: 'center', gap: 20, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer'
                    }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: s.bg }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>{s.title.toUpperCase()}</div>
                            <div style={{ fontSize: 32, fontWeight: 800 }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="three-col-grid" style={{ marginBottom: 24 }}>
                <button 
                    onClick={() => router.push('/admin/users?view=students')}
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
            <div className="two-col-grid">
                
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
                            {recentActivity.length > 0 ? recentActivity.map((r: any, i: number) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', padding: '16px 0', borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center', fontSize: 13 }}>
                                    <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{r.student}</div>
                                    <div style={{ color: '#10b981', fontWeight: 600 }}>{r.action}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)' }}>{r.date}</div>
                                </div>
                            )) : (
                                <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                                    <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                                    No recent activity found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
