'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Clock, CheckCircle, AlertTriangle, Filter, Search, MapPin } from 'lucide-react';

export default function ComplaintsPage() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.complaints) setComplaints(data.complaints);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><div className="spinner"></div></div>;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, margin: '0 0 8px 0', fontWeight: 700 }}>Your Campus Issues</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>Track the status of your reported infrastructure problems.</p>
                </div>
                <button 
                    onClick={() => router.push('/student/complaints/new')}
                    style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white', border: 'none', padding: '12px 24px', borderRadius: 12,
                        display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(99,102,241,0.2)'
                    }}
                >
                    <Plus size={18} /> Report Issue
                </button>
            </div>

            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('success') === 'true' && (
                <div style={{ 
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', 
                    padding: 20, borderRadius: 16, color: '#10b981', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 
                }}>
                    <CheckCircle size={24} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>🎉 Complaint Submitted Successfully!</div>
                        <div style={{ fontSize: 14, color: 'rgba(16,185,129,0.8)', marginTop: 4 }}>Your complaint has been received and is pending admin review.</div>
                    </div>
                </div>
            )}

            {/* Status Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
                {['ALL', 'PENDING_REVIEW', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map(status => (
                    <button 
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        style={{
                            background: statusFilter === status ? '#6366f1' : 'rgba(255,255,255,0.05)',
                            color: statusFilter === status ? 'white' : 'rgba(255,255,255,0.6)',
                            border: '1px solid',
                            borderColor: statusFilter === status ? '#6366f1' : 'rgba(255,255,255,0.1)',
                            padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
                        }}
                    >
                        {status === 'ALL' ? 'All Complaints' : status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {complaints.filter(c => statusFilter === 'ALL' || c.status === statusFilter).length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: 40, borderRadius: 16, textAlign: 'center', color: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        No complaints found for this status.
                    </div>
                ) : (
                    complaints.filter(c => statusFilter === 'ALL' || c.status === statusFilter).map(c => (
                        <div 
                            key={c.id} 
                            onClick={() => router.push(`/student/complaints/${c.id}`)}
                            style={{ 
                                background: 'rgba(255,255,255,0.02)', padding: '24px', 
                                borderRadius: 16, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{ 
                                    width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: c.status === 'RESOLVED' ? 'rgba(16,185,129,0.1)' : c.status === 'IN_PROGRESS' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: c.status === 'RESOLVED' ? '#10b981' : c.status === 'IN_PROGRESS' ? '#fbbf24' : '#ef4444'
                                }}>
                                    {c.status === 'RESOLVED' ? <CheckCircle size={24} /> : c.status === 'IN_PROGRESS' ? <Clock size={24} /> : <AlertTriangle size={24} />}
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 600, color: 'white' }}>{c.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                                        <span style={{ color: '#6366f1', fontWeight: 500 }}>{c.category.replace('_', ' ')}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {c.zone.replace('_', ' ')}</span>
                                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ 
                                fontSize: 12, padding: '6px 16px', borderRadius: 20, fontWeight: 600,
                                background: c.status === 'RESOLVED' ? 'rgba(16,185,129,0.1)' : c.status === 'IN_PROGRESS' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                color: c.status === 'RESOLVED' ? '#10b981' : c.status === 'IN_PROGRESS' ? '#fbbf24' : '#ef4444'
                            }}>
                                {c.status.replace('_', ' ')}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
