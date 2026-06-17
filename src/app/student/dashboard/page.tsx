'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ShieldCheck, Activity, MapPin, Award, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function StudentDashboard() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/student/dashboard')
            .then(res => res.json())
            .then(d => {
                if (d.student) setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><div className="spinner"></div></div>;
    if (!data || !data.student) return <div style={{ color: 'white', textAlign: 'center', marginTop: 100 }}>Student profile not found. Please relogin.</div>;

    const student = data.student;
    const complaints = data.complaints || [];
    const leaderboard = data.leaderboard || [];
    const announcements = data.announcements || [];
    const points = student.rating || 0;

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white' }}>
            {/* Header */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0' }}>Welcome, {student.user?.name || 'Doe'}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 16 }}>
                        Keep reporting campus issues to grow your discipline rating.
                    </p>
                </div>
                <button 
                    onClick={() => router.push('/student/complaints/new')}
                    style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white',
                        border: 'none', padding: '12px 24px', borderRadius: 30, fontSize: 15, fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                    }}
                >
                    <Plus size={20} /> Report a New Issue
                </button>
            </div>

            {/* Pulse Banner */}
            <div style={{
                background: '#0D0E12',
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: 24,
                padding: '40px 20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <img 
                    src="/pulse-logo.png" 
                    alt="Pulse Rating" 
                    style={{ height: 280, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 40px rgba(99,102,241,0.2))' }} 
                />
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
                {/* Total Pulse */}
                <div style={{ background: '#0D0E12', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(99,102,241,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={24} color="#818cf8" />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>TOTAL PULSE</div>
                        <div style={{ fontSize: 28, fontWeight: 700 }}>{points}</div>
                    </div>
                </div>

                {/* Campus Rank */}
                <div style={{ background: '#0D0E12', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(245,158,11,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={24} color="#fbbf24" />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>CAMPUS RANK</div>
                        <div style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{ fontSize: 28 }}>#8</span>
                            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>/ 1000</span>
                        </div>
                    </div>
                </div>

                {/* Current Status */}
                <div style={{ background: '#0D0E12', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                        👍
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>CURRENT STATUS</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#38bdf8' }}>Good</div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 40 }}>
                {/* Left Column: Recent Issues & Announcements */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Announcements Section */}
                    {announcements.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertTriangle size={20} color="#f59e0b" /> Campus Announcements
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {announcements.map((a: any) => (
                                    <div key={a.id} style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', padding: 20, borderRadius: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <h3 style={{ margin: 0, fontSize: 16, color: '#fbbf24' }}>{a.title}</h3>
                                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                                            {a.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Issues List */}
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Your Recent Issues</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {complaints.length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: 32, borderRadius: 16, textAlign: 'center', color: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        You haven't reported any issues yet.
                    </div>
                ) : (
                    complaints.slice(0, 5).map((c: any) => (
                        <div 
                            key={c.id} 
                            onClick={() => router.push(`/student/complaints/${c.id}`)}
                            style={{ 
                                background: 'rgba(255,255,255,0.02)', padding: '20px 24px', 
                                borderRadius: 16, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ 
                                    width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: c.status === 'RESOLVED' ? 'rgba(16,185,129,0.1)' : c.status === 'IN_PROGRESS' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: c.status === 'RESOLVED' ? '#10b981' : c.status === 'IN_PROGRESS' ? '#fbbf24' : '#ef4444'
                                }}>
                                    {c.status === 'RESOLVED' ? <CheckCircle size={20} /> : c.status === 'IN_PROGRESS' ? <Clock size={20} /> : <AlertTriangle size={20} />}
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 500 }}>{c.title}</h3>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{c.category.replace('_', ' ')} • {c.zone.replace('_', ' ')}</div>
                                </div>
                            </div>
                            <div style={{ 
                                fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600,
                                background: c.status === 'RESOLVED' ? 'rgba(16,185,129,0.1)' : c.status === 'IN_PROGRESS' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                color: c.status === 'RESOLVED' ? '#10b981' : c.status === 'IN_PROGRESS' ? '#fbbf24' : '#ef4444'
                            }}>
                                {c.status.replace('_', ' ')}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {complaints.length > 5 && (
                <button onClick={() => router.push('/student/complaints')} style={{ width: '100%', marginTop: 16, padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16, color: 'white', cursor: 'pointer' }}>
                    View All Issues
                </button>
            )}
                    </div>
                </div>

                {/* Right Column: Leaderboard */}
                <div>
                    <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Award size={20} color="#8b5cf6" /> Pulse Leaderboard
                        </h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {leaderboard.map((user: any, index: number) => (
                                <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: index < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <div style={{ 
                                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#b45309' : 'rgba(255,255,255,0.1)',
                                        color: index < 3 ? 'black' : 'white', fontWeight: 800, fontSize: 14
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{user.users?.name || 'Student'}</div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{user.roll_number}</div>
                                    </div>
                                    <div style={{ fontWeight: 800, color: '#10b981' }}>
                                        {user.rating} <span style={{ fontSize: 10, opacity: 0.7 }}>pts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
