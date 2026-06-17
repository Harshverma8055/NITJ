'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, MapPin, Zap, AlertTriangle, MessageSquare, Plus } from 'lucide-react';

export default function AdminComplaintsPage() {
    const router = useRouter();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Active / Working');

    useEffect(() => {
        fetch('/api/complaints')
            .then(res => res.json())
            .then(data => {
                const valid = (data.complaints || []).filter((c: any) => c.category !== 'ANNOUNCEMENT');
                setComplaints(valid);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner"></div></div>;

    const filtered = complaints.filter((c: any) => {
        if (filter === 'All Complaints') return true;
        if (filter === 'Pending Review') return c.status === 'PENDING_REVIEW';
        if (filter === 'Active / Working') return c.status === 'IN_PROGRESS' || c.status === 'PENDING_REVIEW';
        if (filter === 'Resolved / Completed') return c.status === 'RESOLVED';
        if (filter === 'Emergencies') return c.is_emergency;
        return true;
    });

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Campus Issues Management 🏗️
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 15 }}>
                    Review, approve, assign, and track all campus infrastructure complaints.
                </p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 8 }}>
                {['Pending Review', 'Active / Working', 'Resolved / Completed', '🚨 Emergencies', 'All Complaints'].map(f => {
                    const isActive = filter === f.replace('🚨 ', '');
                    return (
                        <button 
                            key={f}
                            onClick={() => setFilter(f.replace('🚨 ', ''))}
                            style={{ 
                                background: isActive ? '#f59e0b' : 'transparent', 
                                color: isActive ? 'black' : 'rgba(255,255,255,0.5)', 
                                border: 'none', padding: '8px 20px', borderRadius: 20, 
                                fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                            }}
                        >
                            {f}
                        </button>
                    );
                })}
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)', background: '#13151a', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                        No issues found matching the selected filter.
                    </div>
                ) : filtered.map((c: any) => {
                    const isEmergency = c.is_emergency;
                    const isResolved = c.status === 'RESOLVED';
                    const isWorking = c.status === 'IN_PROGRESS';
                    const isPending = c.status === 'PENDING_REVIEW';
                    
                    const score = c.upvote_count > 0 ? (14.44 + c.upvote_count).toFixed(2) : '15.97';

                    return (
                        <div key={c.id} style={{ 
                            background: '#13151A', 
                            border: `1px solid ${isEmergency ? '#ef4444' : 'rgba(255,255,255,0.05)'}`, 
                            borderRadius: 16, overflow: 'hidden'
                        }}>
                            {/* Top Bar with ID */}
                            <div style={{ padding: '12px 24px', borderBottom: `1px solid ${isEmergency ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                <div>ID: {c.id.split('-')[0].toUpperCase()} - Score: {score}</div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button onClick={() => router.push(`/admin/complaints/${c.id}`)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)' }}></div> View
                                    </button>
                                    {!isResolved && (
                                        <button onClick={() => router.push(`/admin/complaints/${c.id}`)} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 14 }}>👤</span> Assign Staff
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Emergency Red Banner */}
                            {isEmergency && (
                                <div style={{ background: '#ef4444', color: 'white', padding: '8px 24px', fontSize: 12, fontWeight: 700, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <AlertTriangle size={14} /> EMERGENCY ISSUE — IMMEDIATE ATTENTION REQUIRED
                                </div>
                            )}

                            {/* Main Content */}
                            <div style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div style={{ 
                                        color: isEmergency ? '#ef4444' : isResolved ? '#10b981' : '#f59e0b', 
                                        display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 
                                    }}>
                                        {isEmergency ? <AlertTriangle size={14} /> : <Zap size={14} />} 
                                        {isEmergency ? 'EMERGENCY' : c.priority === 'LOW' ? 'LOW PRIORITY' : 'MODERATE'}
                                    </div>
                                    <div style={{ 
                                        background: isResolved ? 'rgba(16,185,129,0.1)' : isWorking ? 'rgba(6,182,212,0.1)' : 'rgba(59,130,246,0.1)',
                                        color: isResolved ? '#10b981' : isWorking ? '#06b6d4' : '#3b82f6',
                                        padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700
                                    }}>
                                        {isResolved ? 'Resolved' : isWorking ? 'Work In Progress' : 'Approved'}
                                    </div>
                                </div>

                                <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700 }}>{c.title}</h3>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>
                                    <MapPin size={14} /> {c.zone.replace('_', ' ')}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                                        <MessageSquare size={14} /> {c.comments?.length || 0}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)' }}></div>
                                        Inderjeet ({c.reporter_student_id ? '234567' : '11111'}) • {new Date(c.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
