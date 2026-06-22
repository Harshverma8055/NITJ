'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, MapPin, Zap, AlertTriangle, MessageSquare, Plus, ThumbsUp, Clock } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/department-router';

function ComplaintsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Read from searchParams immediately to set initial state correctly
    const initialDept = searchParams.get('dept') || 'ALL';
    const initialFilter = searchParams.get('filter') || 'Pending';

    const [complaints, setComplaints] = useState<any[]>([]);
    const [initialLoad, setInitialLoad] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [filter, setFilter] = useState(initialFilter);
    const [selectedDept, setSelectedDept] = useState(initialDept);
    const [counts, setCounts] = useState<Record<string, number>>({
        'Pending': 0,
        'Active': 0,
        'Resolved': 0,
        'Emergencies': 0,
        'All Complaints': 0
    });

    // When searchParams change due to soft navigation, update state
    useEffect(() => {
        const dept = searchParams.get('dept');
        const filt = searchParams.get('filter');
        if (dept) setSelectedDept(dept);
        if (filt) setFilter(filt);
    }, [searchParams]);

    const fetchCounts = (dept: string) => {
        let deptParam = '';
        if (dept !== 'ALL') {
            deptParam = `&department=${encodeURIComponent(dept)}`;
        }
        Promise.all([
            fetch(`/api/complaints?limit=1&status=PENDING_REVIEW${deptParam}`).then(res => res.json()),
            fetch(`/api/complaints?limit=1&status=APPROVED,ASSIGNED,IN_PROGRESS${deptParam}`).then(res => res.json()),
            fetch(`/api/complaints?limit=1&status=RESOLVED${deptParam}`).then(res => res.json()),
            fetch(`/api/complaints?limit=1&status=APPROVED,ASSIGNED,IN_PROGRESS,RESOLVED${deptParam}`).then(res => res.json()),
            fetch(`/api/complaints?limit=1&is_emergency=true&status=PENDING_REVIEW,APPROVED,ASSIGNED,IN_PROGRESS${deptParam}`).then(res => res.json()),
        ]).then(([pendingData, activeData, resolvedData, allData, emergencyData]) => {
            setCounts({
                'Pending': pendingData.total || 0,
                'Active': activeData.total || 0,
                'Resolved': resolvedData.total || 0,
                'All Complaints': allData.total || 0,
                'Emergencies': emergencyData.total || 0
            });
        }).catch(err => console.error("Error fetching status counts", err));
    };

    useEffect(() => {
        setIsFetching(true);
        let statusParam = '';
        let emergencyParam = '';
        if (filter === 'Pending') {
            statusParam = 'status=PENDING_REVIEW';
        } else if (filter === 'Active') {
            statusParam = 'status=APPROVED,ASSIGNED,IN_PROGRESS';
        } else if (filter === 'Resolved') {
            statusParam = 'status=RESOLVED';
        } else if (filter === 'All Complaints') {
            statusParam = 'status=APPROVED,ASSIGNED,IN_PROGRESS,RESOLVED';
        } else if (filter === 'Emergencies') {
            emergencyParam = 'is_emergency=true';
            statusParam = 'status=PENDING_REVIEW,APPROVED,ASSIGNED,IN_PROGRESS';
        }
        
        let deptParam = '';
        if (selectedDept !== 'ALL') {
            deptParam = `&department=${encodeURIComponent(selectedDept)}`;
        }
        
        const url = `/api/complaints?limit=50&sort=latest${statusParam ? `&${statusParam}` : ''}${emergencyParam ? `&${emergencyParam}` : ''}${deptParam}`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const valid = (data.complaints || []).filter((c: any) => c.category !== 'ANNOUNCEMENT');
                setComplaints(valid);
                setInitialLoad(false);
                setIsFetching(false);
            })
            .catch(() => {
                setInitialLoad(false);
                setIsFetching(false);
            });

        fetchCounts(selectedDept);
    }, [filter, selectedDept]);

    if (initialLoad) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner"></div></div>;

    const filtered = complaints.filter((c: any) => {
        // Status filter
        if (filter === 'Pending' && c.status !== 'PENDING_REVIEW') return false;
        if (filter === 'Active' && c.status !== 'IN_PROGRESS' && c.status !== 'ASSIGNED' && c.status !== 'APPROVED') return false;
        if (filter === 'Resolved' && c.status !== 'RESOLVED') return false;
        if (filter === 'Emergencies' && (!c.is_emergency || c.status === 'RESOLVED')) return false;
        if (filter === 'All Complaints' && c.status === 'PENDING_REVIEW') return false;

        // Department filter
        if (selectedDept !== 'ALL' && c.assigned_department_code !== selectedDept) return false;

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

            {/* Filters Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
                {/* Status Tabs */}
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
                    {[
                        { id: 'Pending', label: 'Pending' },
                        { id: 'Emergencies', label: '🚨 Emergencies' },
                        { id: 'Active', label: 'Active' },
                        { id: 'Resolved', label: 'Resolved' },
                        { id: 'All Complaints', label: 'All Complaints' }
                    ].map(tab => {
                        const isActive = filter === tab.id;
                        const count = counts[tab.id] || 0;
                        return (
                            <button 
                                key={tab.id}
                                onClick={() => {
                                    setFilter(tab.id);
                                    if (tab.id === 'Pending') {
                                        setSelectedDept('ALL');
                                    }
                                }}
                                style={{ 
                                    background: isActive ? '#f59e0b' : 'transparent', 
                                    color: isActive ? 'black' : 'rgba(255,255,255,0.5)', 
                                    border: 'none', padding: '8px 20px', borderRadius: 20, 
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                                    display: 'flex', alignItems: 'center', gap: 8
                                }}
                            >
                                <span>{tab.label}</span>
                                <span style={{ 
                                    background: isActive ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)', 
                                    color: isActive ? 'black' : 'rgba(255,255,255,0.7)', 
                                    padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 
                                }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Department Dropdown Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 8 }}>
                        {isFetching ? <span style={{ color: '#f59e0b', fontWeight: 600 }}>Updating...</span> : <span>Total: <strong>{filtered.length}</strong></span>}
                    </div>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Department:</span>
                    <select
                        value={selectedDept}
                        onChange={e => setSelectedDept(e.target.value)}
                        style={{
                            background: '#13151A',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '8px 16px',
                            borderRadius: 20,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="ALL">All Departments</option>
                        {Object.entries(DEPARTMENTS).map(([code, dept]) => (
                            <option key={code} value={code}>{dept.shortName}</option>
                        ))}
                    </select>
                </div>
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
                    return (
                        <div 
                            key={c.id} 
                            onClick={() => router.push(`/admin/complaints/${c.id}`)}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = isEmergency ? '0 12px 30px rgba(239,68,68,0.15)' : '0 12px 30px rgba(0,0,0,0.4)';
                                e.currentTarget.style.borderColor = isEmergency ? '#ef4444' : 'rgba(255,255,255,0.15)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = isEmergency ? '#ef4444' : 'rgba(255,255,255,0.05)';
                            }}
                            style={{ 
                                background: '#13151A', 
                                border: `1px solid ${isEmergency ? '#ef4444' : 'rgba(255,255,255,0.05)'}`, 
                                borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                                transition: 'all 0.25s ease-in-out'
                            }}
                        >
                            {/* Emergency Red Banner */}
                            {isEmergency && (
                                <div style={{ background: '#ef4444', color: 'white', padding: '8px 24px', fontSize: 12, fontWeight: 700, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <AlertTriangle size={14} /> EMERGENCY ISSUE — IMMEDIATE ATTENTION REQUIRED
                                </div>
                            )}

                            {/* Main Content */}
                            <div style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{
                                            background: isResolved ? 'rgba(16,185,129,0.1)' : isWorking ? 'rgba(6,182,212,0.1)' : isPending ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                                            color: isResolved ? '#10b981' : isWorking ? '#06b6d4' : isPending ? '#f59e0b' : '#3b82f6',
                                            padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: 0.5
                                        }}>
                                            {isResolved ? 'RESOLVED' : isWorking ? 'IN PROGRESS' : isPending ? 'PENDING REVIEW' : 'APPROVED'}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 0.5 }}>
                                            ID: {c.id.split('-')[0].toUpperCase()}
                                        </div>
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Clock size={14} />
                                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700, color: 'white' }}>{c.title}</h3>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 20 }}>
                                    <MapPin size={14} /> {c.zone.replace('_', ' ')}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 20, fontWeight: 500 }}>
                                            <ThumbsUp size={14} color="#f59e0b" /> <span>{c.upvote_count || 0} Upvotes</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 20, fontWeight: 500 }}>
                                            <MessageSquare size={14} color="#3b82f6" /> <span>{c.comment_count || 0} Comments</span>
                                        </div>
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold' }}>
                                            {(c.reporter?.name || 'A')[0].toUpperCase()}
                                        </div>
                                        <span>{c.reporter?.name || 'Anonymous'} ({c.reporter?.rollNumber || 'N/A'})</span>
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

export default function AdminComplaintsPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner"></div></div>}>
            <ComplaintsContent />
        </Suspense>
    );
}

